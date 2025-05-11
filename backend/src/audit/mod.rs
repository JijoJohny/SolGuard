use crate::db::Pool;
use crate::error::AppError;
use serde::{Deserialize, Serialize};
use sqlx::{query, query_as};

#[derive(Debug, Serialize, Deserialize)]
pub struct AuditLog {
    pub id: i32,
    pub user_id: Option<i32>,
    pub action: String,
    pub entity_type: String,
    pub entity_id: Option<i32>,
    pub details: Option<serde_json::Value>,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

pub struct AuditService {
    pool: Pool,
}

impl AuditService {
    pub fn new(pool: Pool) -> Self {
        Self { pool }
    }

    pub async fn log_event(
        &self,
        user_id: Option<i32>,
        action: &str,
        entity_type: &str,
        entity_id: Option<i32>,
        details: Option<serde_json::Value>,
        ip_address: Option<String>,
        user_agent: Option<String>,
    ) -> Result<i32, AppError> {
        let log_id = query!(
            r#"
            SELECT log_audit_event($1, $2, $3, $4, $5, $6, $7) as id
            "#,
            user_id,
            action,
            entity_type,
            entity_id,
            details,
            ip_address,
            user_agent
        )
        .fetch_one(&self.pool)
        .await?
        .id;

        Ok(log_id)
    }

    pub async fn get_user_logs(
        &self,
        user_id: i32,
        limit: i64,
        offset: i64,
    ) -> Result<Vec<AuditLog>, AppError> {
        let logs = query_as!(
            AuditLog,
            r#"
            SELECT * FROM audit_logs
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
            "#,
            user_id,
            limit,
            offset
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(logs)
    }

    pub async fn get_entity_logs(
        &self,
        entity_type: &str,
        entity_id: i32,
        limit: i64,
        offset: i64,
    ) -> Result<Vec<AuditLog>, AppError> {
        let logs = query_as!(
            AuditLog,
            r#"
            SELECT * FROM audit_logs
            WHERE entity_type = $1 AND entity_id = $2
            ORDER BY created_at DESC
            LIMIT $3 OFFSET $4
            "#,
            entity_type,
            entity_id,
            limit,
            offset
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(logs)
    }

    pub async fn search_logs(
        &self,
        action: Option<&str>,
        entity_type: Option<&str>,
        start_date: Option<chrono::DateTime<chrono::Utc>>,
        end_date: Option<chrono::DateTime<chrono::Utc>>,
        limit: i64,
        offset: i64,
    ) -> Result<Vec<AuditLog>, AppError> {
        let logs = query_as!(
            AuditLog,
            r#"
            SELECT * FROM audit_logs
            WHERE ($1::text IS NULL OR action = $1)
            AND ($2::text IS NULL OR entity_type = $2)
            AND ($3::timestamp IS NULL OR created_at >= $3)
            AND ($4::timestamp IS NULL OR created_at <= $4)
            ORDER BY created_at DESC
            LIMIT $5 OFFSET $6
            "#,
            action,
            entity_type,
            start_date,
            end_date,
            limit,
            offset
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(logs)
    }
} 