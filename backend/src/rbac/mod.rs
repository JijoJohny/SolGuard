use crate::db::Pool;
use crate::error::AppError;
use serde::{Deserialize, Serialize};
use sqlx::{query, query_as};

#[derive(Debug, Serialize, Deserialize)]
pub struct Role {
    pub id: i32,
    pub name: String,
    pub description: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Permission {
    pub id: i32,
    pub name: String,
    pub description: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserRole {
    pub user_id: i32,
    pub role_id: i32,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

pub struct RbacService {
    pool: Pool,
}

impl RbacService {
    pub fn new(pool: Pool) -> Self {
        Self { pool }
    }

    pub async fn get_user_roles(&self, user_id: i32) -> Result<Vec<Role>, AppError> {
        let roles = query_as!(
            Role,
            r#"
            SELECT r.* FROM roles r
            INNER JOIN user_roles ur ON ur.role_id = r.id
            WHERE ur.user_id = $1
            "#,
            user_id
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(roles)
    }

    pub async fn get_role_permissions(&self, role_id: i32) -> Result<Vec<Permission>, AppError> {
        let permissions = query_as!(
            Permission,
            r#"
            SELECT p.* FROM permissions p
            INNER JOIN role_permissions rp ON rp.permission_id = p.id
            WHERE rp.role_id = $1
            "#,
            role_id
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(permissions)
    }

    pub async fn assign_role_to_user(&self, user_id: i32, role_id: i32) -> Result<(), AppError> {
        query!(
            r#"
            INSERT INTO user_roles (user_id, role_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, role_id) DO NOTHING
            "#,
            user_id,
            role_id
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn remove_role_from_user(&self, user_id: i32, role_id: i32) -> Result<(), AppError> {
        query!(
            r#"
            DELETE FROM user_roles
            WHERE user_id = $1 AND role_id = $2
            "#,
            user_id,
            role_id
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn has_permission(&self, user_id: i32, permission_name: &str) -> Result<bool, AppError> {
        let count = query!(
            r#"
            SELECT COUNT(*) as count
            FROM permissions p
            INNER JOIN role_permissions rp ON rp.permission_id = p.id
            INNER JOIN user_roles ur ON ur.role_id = rp.role_id
            WHERE ur.user_id = $1 AND p.name = $2
            "#,
            user_id,
            permission_name
        )
        .fetch_one(&self.pool)
        .await?
        .count
        .unwrap_or(0);

        Ok(count > 0)
    }
} 