use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use crate::types::AnalysisReport;

#[derive(Debug, Serialize, Deserialize)]
pub enum NotificationType {
    AnalysisComplete,
    NewVulnerability,
    VulnerabilityFixed,
    ProjectInvite,
    ProjectUpdate,
    Custom(String),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Notification {
    pub id: String,
    pub user_id: String,
    pub project_id: Option<String>,
    pub notification_type: NotificationType,
    pub title: String,
    pub message: String,
    pub data: Option<serde_json::Value>,
    pub read: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NotificationPreferences {
    pub user_id: String,
    pub email_notifications: bool,
    pub slack_notifications: bool,
    pub webhook_url: Option<String>,
    pub notification_types: Vec<NotificationType>,
}

pub struct NotificationService {
    db: PgPool,
    email_client: Option<EmailClient>,
    slack_client: Option<SlackClient>,
}

impl NotificationService {
    pub fn new(db: PgPool) -> Self {
        Self {
            db,
            email_client: None,
            slack_client: None,
        }
    }

    pub fn with_email_client(mut self, client: EmailClient) -> Self {
        self.email_client = Some(client);
        self
    }

    pub fn with_slack_client(mut self, client: SlackClient) -> Self {
        self.slack_client = Some(client);
        self
    }

    pub async fn create_notification(
        &self,
        user_id: &str,
        project_id: Option<&str>,
        notification_type: NotificationType,
        title: &str,
        message: &str,
        data: Option<serde_json::Value>,
    ) -> Result<Notification, String> {
        let notification = sqlx::query!(
            r#"
            INSERT INTO notifications (user_id, project_id, type, title, message, data)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, user_id, project_id, type, title, message, data, read, created_at
            "#,
            user_id,
            project_id,
            serde_json::to_value(&notification_type).unwrap(),
            title,
            message,
            data,
        )
        .fetch_one(&self.db)
        .await
        .map_err(|e| e.to_string())?;

        // Get user preferences
        let preferences = self.get_user_preferences(user_id).await?;

        // Send notifications based on preferences
        if preferences.email_notifications {
            if let Some(email_client) = &self.email_client {
                email_client.send_notification(&notification).await?;
            }
        }

        if preferences.slack_notifications {
            if let Some(slack_client) = &self.slack_client {
                slack_client.send_notification(&notification).await?;
            }
        }

        if let Some(webhook_url) = preferences.webhook_url {
            self.send_webhook_notification(&notification, &webhook_url).await?;
        }

        Ok(notification)
    }

    pub async fn get_user_notifications(
        &self,
        user_id: &str,
        limit: i64,
        offset: i64,
    ) -> Result<Vec<Notification>, String> {
        let notifications = sqlx::query!(
            r#"
            SELECT id, user_id, project_id, type, title, message, data, read, created_at
            FROM notifications
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
            "#,
            user_id,
            limit,
            offset,
        )
        .fetch_all(&self.db)
        .await
        .map_err(|e| e.to_string())?;

        Ok(notifications
            .into_iter()
            .map(|n| Notification {
                id: n.id,
                user_id: n.user_id,
                project_id: n.project_id,
                notification_type: serde_json::from_value(n.type_).unwrap(),
                title: n.title,
                message: n.message,
                data: n.data,
                read: n.read,
                created_at: n.created_at,
            })
            .collect())
    }

    pub async fn mark_notification_read(&self, notification_id: &str) -> Result<(), String> {
        sqlx::query!(
            r#"
            UPDATE notifications
            SET read = true
            WHERE id = $1
            "#,
            notification_id,
        )
        .execute(&self.db)
        .await
        .map_err(|e| e.to_string())?;

        Ok(())
    }

    pub async fn get_user_preferences(
        &self,
        user_id: &str,
    ) -> Result<NotificationPreferences, String> {
        let preferences = sqlx::query!(
            r#"
            SELECT email_notifications, slack_notifications, webhook_url, notification_types
            FROM notification_preferences
            WHERE user_id = $1
            "#,
            user_id,
        )
        .fetch_one(&self.db)
        .await
        .map_err(|e| e.to_string())?;

        Ok(NotificationPreferences {
            user_id: user_id.to_string(),
            email_notifications: preferences.email_notifications,
            slack_notifications: preferences.slack_notifications,
            webhook_url: preferences.webhook_url,
            notification_types: serde_json::from_value(preferences.notification_types).unwrap(),
        })
    }

    pub async fn update_user_preferences(
        &self,
        preferences: NotificationPreferences,
    ) -> Result<(), String> {
        sqlx::query!(
            r#"
            INSERT INTO notification_preferences (user_id, email_notifications, slack_notifications, webhook_url, notification_types)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (user_id) DO UPDATE
            SET email_notifications = $2,
                slack_notifications = $3,
                webhook_url = $4,
                notification_types = $5
            "#,
            preferences.user_id,
            preferences.email_notifications,
            preferences.slack_notifications,
            preferences.webhook_url,
            serde_json::to_value(&preferences.notification_types).unwrap(),
        )
        .execute(&self.db)
        .await
        .map_err(|e| e.to_string())?;

        Ok(())
    }

    async fn send_webhook_notification(
        &self,
        notification: &Notification,
        webhook_url: &str,
    ) -> Result<(), String> {
        // Implement webhook notification
        Ok(())
    }
}

pub struct EmailClient {
    smtp_server: String,
    smtp_port: u16,
    username: String,
    password: String,
}

impl EmailClient {
    pub fn new(smtp_server: String, smtp_port: u16, username: String, password: String) -> Self {
        Self {
            smtp_server,
            smtp_port,
            username,
            password,
        }
    }

    pub async fn send_notification(&self, notification: &Notification) -> Result<(), String> {
        // Implement email sending
        Ok(())
    }
}

pub struct SlackClient {
    webhook_url: String,
}

impl SlackClient {
    pub fn new(webhook_url: String) -> Self {
        Self { webhook_url }
    }

    pub async fn send_notification(&self, notification: &Notification) -> Result<(), String> {
        // Implement Slack notification
        Ok(())
    }
} 