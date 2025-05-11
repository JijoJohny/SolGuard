use actix_web::{web, HttpResponse, Scope, post, get};
use actix_identity::Identity;
use actix_session::Session;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use jsonwebtoken::{encode, decode, Header, EncodingKey, DecodingKey, Validation};
use bcrypt::{hash, verify, DEFAULT_COST};
use chrono::{Utc, Duration};
use validator::Validate;

use crate::api::{ApiResponse, ApiScope, AppState};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,  // user id
    pub exp: i64,     // expiration time
    pub iat: i64,     // issued at
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct LoginRequest {
    #[validate(email)]
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct RegisterRequest {
    #[validate(email)]
    pub email: String,
    #[validate(length(min = 8))]
    pub password: String,
    pub name: String,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub user: UserResponse,
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: String,
    pub email: String,
    pub name: String,
}

impl ApiScope for auth {
    fn scope() -> Scope {
        web::scope("/auth")
            .service(login)
            .service(register)
            .service(logout)
            .service(me)
    }
}

#[post("/login")]
async fn login(
    state: web::Data<AppState>,
    session: Session,
    req: web::Json<LoginRequest>,
) -> HttpResponse {
    // Validate request
    if let Err(e) = req.validate() {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error(e.to_string()));
    }

    // Get user from database
    let user = match sqlx::query!(
        "SELECT id, email, password_hash, name FROM users WHERE email = $1",
        req.email
    )
    .fetch_optional(&state.db)
    .await
    {
        Ok(Some(user)) => user,
        Ok(None) => {
            return HttpResponse::Unauthorized()
                .json(ApiResponse::<()>::error("Invalid credentials".to_string()));
        }
        Err(e) => {
            return HttpResponse::InternalServerError()
                .json(ApiResponse::<()>::error(e.to_string()));
        }
    };

    // Verify password
    if !verify(&req.password, &user.password_hash).unwrap_or(false) {
        return HttpResponse::Unauthorized()
            .json(ApiResponse::<()>::error("Invalid credentials".to_string()));
    }

    // Generate JWT
    let exp = (Utc::now() + Duration::days(7)).timestamp();
    let claims = Claims {
        sub: user.id,
        exp,
        iat: Utc::now().timestamp(),
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(std::env::var("JWT_SECRET").unwrap().as_bytes()),
    )
    .unwrap();

    // Set session
    session.insert("user_id", &user.id).unwrap();

    HttpResponse::Ok().json(ApiResponse::success(AuthResponse {
        token,
        user: UserResponse {
            id: user.id,
            email: user.email,
            name: user.name,
        },
    }))
}

#[post("/register")]
async fn register(
    state: web::Data<AppState>,
    req: web::Json<RegisterRequest>,
) -> HttpResponse {
    // Validate request
    if let Err(e) = req.validate() {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error(e.to_string()));
    }

    // Hash password
    let password_hash = hash(req.password.as_bytes(), DEFAULT_COST).unwrap();

    // Insert user
    let user = match sqlx::query!(
        "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name",
        req.email,
        password_hash,
        req.name
    )
    .fetch_one(&state.db)
    .await
    {
        Ok(user) => user,
        Err(e) => {
            return HttpResponse::InternalServerError()
                .json(ApiResponse::<()>::error(e.to_string()));
        }
    };

    HttpResponse::Created().json(ApiResponse::success(UserResponse {
        id: user.id,
        email: user.email,
        name: user.name,
    }))
}

#[post("/logout")]
async fn logout(session: Session) -> HttpResponse {
    session.purge();
    HttpResponse::Ok().json(ApiResponse::<()>::success(()))
}

#[get("/me")]
async fn me(
    state: web::Data<AppState>,
    identity: Identity,
) -> HttpResponse {
    let user_id = match identity.id() {
        Ok(id) => id,
        Err(_) => {
            return HttpResponse::Unauthorized()
                .json(ApiResponse::<()>::error("Not authenticated".to_string()));
        }
    };

    let user = match sqlx::query!(
        "SELECT id, email, name FROM users WHERE id = $1",
        user_id
    )
    .fetch_optional(&state.db)
    .await
    {
        Ok(Some(user)) => user,
        _ => {
            return HttpResponse::Unauthorized()
                .json(ApiResponse::<()>::error("User not found".to_string()));
        }
    };

    HttpResponse::Ok().json(ApiResponse::success(UserResponse {
        id: user.id,
        email: user.email,
        name: user.name,
    }))
} 