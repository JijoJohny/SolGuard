use actix_web::{web, HttpResponse, Scope, post, get};
use actix_identity::Identity;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tokio::fs;
use uuid::Uuid;

use crate::api::{ApiResponse, ApiScope, AppState};
use crate::analyzer::Analyzer;
use crate::types::AnalysisReport;

#[derive(Debug, Serialize, Deserialize)]
pub struct AnalysisRequest {
    pub project_id: String,
    pub file_path: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AnalysisResult {
    pub id: String,
    pub project_id: String,
    pub file_path: String,
    pub report: AnalysisReport,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

impl ApiScope for analysis {
    fn scope() -> Scope {
        web::scope("/analysis")
            .service(analyze_file)
            .service(get_analysis)
            .service(list_analyses)
    }
}

#[post("/analyze")]
async fn analyze_file(
    state: web::Data<AppState>,
    identity: Identity,
    req: web::Json<AnalysisRequest>,
) -> HttpResponse {
    let user_id = match identity.id() {
        Ok(id) => id,
        Err(_) => {
            return HttpResponse::Unauthorized()
                .json(ApiResponse::<()>::error("Not authenticated".to_string()));
        }
    };

    // Verify project ownership
    let project = match sqlx::query!(
        "SELECT id FROM projects WHERE id = $1 AND user_id = $2",
        req.project_id,
        user_id
    )
    .fetch_optional(&state.db)
    .await
    {
        Ok(Some(_)) => (),
        _ => {
            return HttpResponse::Forbidden()
                .json(ApiResponse::<()>::error("Project not found or access denied".to_string()));
        }
    };

    // Get project path
    let project_path = PathBuf::from(format!("./projects/{}", req.project_id));
    let file_path = project_path.join(&req.file_path);

    // Verify file exists and is within project directory
    if !file_path.exists() || !file_path.starts_with(&project_path) {
        return HttpResponse::BadRequest()
            .json(ApiResponse::<()>::error("File not found or access denied".to_string()));
    }

    // Run analysis
    let report = match state.analyzer.analyze_file(&file_path).await {
        Ok(report) => report,
        Err(e) => {
            return HttpResponse::InternalServerError()
                .json(ApiResponse::<()>::error(e.to_string()));
        }
    };

    // Save analysis result
    let analysis_id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now();

    match sqlx::query!(
        "INSERT INTO analysis_results (id, project_id, file_path, report, created_at) 
         VALUES ($1, $2, $3, $4, $5)",
        analysis_id,
        req.project_id,
        req.file_path,
        serde_json::to_value(&report).unwrap(),
        now
    )
    .execute(&state.db)
    .await
    {
        Ok(_) => (),
        Err(e) => {
            return HttpResponse::InternalServerError()
                .json(ApiResponse::<()>::error(e.to_string()));
        }
    }

    HttpResponse::Ok().json(ApiResponse::success(AnalysisResult {
        id: analysis_id,
        project_id: req.project_id.clone(),
        file_path: req.file_path.clone(),
        report,
        created_at: now,
    }))
}

#[get("/{analysis_id}")]
async fn get_analysis(
    state: web::Data<AppState>,
    identity: Identity,
    analysis_id: web::Path<String>,
) -> HttpResponse {
    let user_id = match identity.id() {
        Ok(id) => id,
        Err(_) => {
            return HttpResponse::Unauthorized()
                .json(ApiResponse::<()>::error("Not authenticated".to_string()));
        }
    };

    // Get analysis result
    let analysis = match sqlx::query!(
        "SELECT a.* FROM analysis_results a 
         JOIN projects p ON a.project_id = p.id 
         WHERE a.id = $1 AND p.user_id = $2",
        analysis_id.into_inner(),
        user_id
    )
    .fetch_optional(&state.db)
    .await
    {
        Ok(Some(analysis)) => analysis,
        _ => {
            return HttpResponse::NotFound()
                .json(ApiResponse::<()>::error("Analysis not found".to_string()));
        }
    };

    let report: AnalysisReport = serde_json::from_value(analysis.report).unwrap();

    HttpResponse::Ok().json(ApiResponse::success(AnalysisResult {
        id: analysis.id,
        project_id: analysis.project_id,
        file_path: analysis.file_path,
        report,
        created_at: analysis.created_at,
    }))
}

#[get("/project/{project_id}")]
async fn list_analyses(
    state: web::Data<AppState>,
    identity: Identity,
    project_id: web::Path<String>,
) -> HttpResponse {
    let user_id = match identity.id() {
        Ok(id) => id,
        Err(_) => {
            return HttpResponse::Unauthorized()
                .json(ApiResponse::<()>::error("Not authenticated".to_string()));
        }
    };

    // Verify project ownership
    let project = match sqlx::query!(
        "SELECT id FROM projects WHERE id = $1 AND user_id = $2",
        project_id.into_inner(),
        user_id
    )
    .fetch_optional(&state.db)
    .await
    {
        Ok(Some(_)) => (),
        _ => {
            return HttpResponse::Forbidden()
                .json(ApiResponse::<()>::error("Project not found or access denied".to_string()));
        }
    };

    // Get analysis results
    let analyses = match sqlx::query!(
        "SELECT * FROM analysis_results WHERE project_id = $1 ORDER BY created_at DESC",
        project_id.into_inner()
    )
    .fetch_all(&state.db)
    .await
    {
        Ok(analyses) => analyses,
        Err(e) => {
            return HttpResponse::InternalServerError()
                .json(ApiResponse::<()>::error(e.to_string()));
        }
    };

    let results: Vec<AnalysisResult> = analyses
        .into_iter()
        .map(|a| {
            let report: AnalysisReport = serde_json::from_value(a.report).unwrap();
            AnalysisResult {
                id: a.id,
                project_id: a.project_id,
                file_path: a.file_path,
                report,
                created_at: a.created_at,
            }
        })
        .collect();

    HttpResponse::Ok().json(ApiResponse::success(results))
} 