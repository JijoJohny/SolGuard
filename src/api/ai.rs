use actix_web::{web, HttpResponse, Scope};
use crate::ai::{AiSecurityAnalyzer, AiCodeGenerator, AiAnalysisResult, AiSuggestion};
use crate::types::{AnalysisReport, Vulnerability};
use crate::rules::custom::RuleMatch;
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AnalyzeCodeRequest {
    pub code: String,
    pub project_id: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GenerateCodeRequest {
    pub requirements: String,
    pub project_id: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SuggestImprovementsRequest {
    pub code: String,
    pub rule_matches: Vec<RuleMatch>,
    pub project_id: String,
}

pub fn ai_scope() -> Scope {
    web::scope("/ai")
        .service(web::resource("/analyze").route(web::post().to(analyze_code)))
        .service(web::resource("/generate").route(web::post().to(generate_code)))
        .service(web::resource("/suggest").route(web::post().to(suggest_improvements)))
        .service(web::resource("/analyze-vulnerability").route(web::post().to(analyze_vulnerability)))
}

async fn analyze_code(
    req: web::Json<AnalyzeCodeRequest>,
    analyzer: web::Data<AiSecurityAnalyzer>,
) -> HttpResponse {
    match analyzer.analyze_code(&req.code).await {
        Ok(result) => HttpResponse::Ok().json(result),
        Err(e) => HttpResponse::InternalServerError().json(e),
    }
}

async fn generate_code(
    req: web::Json<GenerateCodeRequest>,
    generator: web::Data<AiCodeGenerator>,
) -> HttpResponse {
    match generator.generate_secure_code(&req.requirements).await {
        Ok(code) => HttpResponse::Ok().json(code),
        Err(e) => HttpResponse::InternalServerError().json(e),
    }
}

async fn suggest_improvements(
    req: web::Json<SuggestImprovementsRequest>,
    analyzer: web::Data<AiSecurityAnalyzer>,
) -> HttpResponse {
    let mut suggestions = Vec::new();
    
    for rule_match in &req.rule_matches {
        if let Ok(improvements) = analyzer.suggest_improvements(rule_match).await {
            suggestions.extend(improvements);
        }
    }
    
    HttpResponse::Ok().json(suggestions)
}

async fn analyze_vulnerability(
    vulnerability: web::Json<Vulnerability>,
    analyzer: web::Data<AiSecurityAnalyzer>,
) -> HttpResponse {
    match analyzer.analyze_vulnerability(&vulnerability).await {
        Ok(suggestion) => HttpResponse::Ok().json(suggestion),
        Err(e) => HttpResponse::InternalServerError().json(e),
    }
} 