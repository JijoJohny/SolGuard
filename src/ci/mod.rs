use serde::{Serialize, Deserialize};
use std::path::PathBuf;
use tokio::fs;
use crate::analyzer::Analyzer;
use crate::types::AnalysisReport;

#[derive(Debug, Serialize, Deserialize)]
pub enum CiProvider {
    GitHub,
    GitLab,
    Bitbucket,
    Jenkins,
    CircleCI,
    Custom(String),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CiConfig {
    pub provider: CiProvider,
    pub project_id: String,
    pub branch: String,
    pub commit: String,
    pub pull_request: Option<String>,
    pub webhook_url: Option<String>,
    pub api_key: Option<String>,
    pub custom_headers: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CiResult {
    pub success: bool,
    pub message: String,
    pub report: Option<AnalysisReport>,
    pub summary: Option<CiSummary>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CiSummary {
    pub total_issues: usize,
    pub critical_issues: usize,
    pub high_issues: usize,
    pub medium_issues: usize,
    pub low_issues: usize,
    pub info_issues: usize,
}

pub struct CiIntegration {
    config: CiConfig,
    analyzer: Analyzer,
}

impl CiIntegration {
    pub fn new(config: CiConfig, analyzer: Analyzer) -> Self {
        Self { config, analyzer }
    }

    pub async fn run_analysis(&self, files: Vec<PathBuf>) -> Result<CiResult, String> {
        let mut all_reports = Vec::new();
        let mut total_issues = 0;
        let mut critical_issues = 0;
        let mut high_issues = 0;
        let mut medium_issues = 0;
        let mut low_issues = 0;
        let mut info_issues = 0;

        for file in files {
            if let Ok(content) = fs::read_to_string(&file).await {
                let report = self.analyzer.analyze_file(&file).await?;
                
                // Count issues by severity
                for vulnerability in &report.vulnerabilities {
                    total_issues += 1;
                    match vulnerability.severity.as_str() {
                        "Critical" => critical_issues += 1,
                        "High" => high_issues += 1,
                        "Medium" => medium_issues += 1,
                        "Low" => low_issues += 1,
                        "Info" => info_issues += 1,
                        _ => (),
                    }
                }

                all_reports.push(report);
            }
        }

        let summary = CiSummary {
            total_issues,
            critical_issues,
            high_issues,
            medium_issues,
            low_issues,
            info_issues,
        };

        let success = critical_issues == 0 && high_issues == 0;

        let result = CiResult {
            success,
            message: if success {
                "Security analysis passed".to_string()
            } else {
                format!(
                    "Security analysis failed: {} critical, {} high, {} medium, {} low, {} info issues found",
                    critical_issues, high_issues, medium_issues, low_issues, info_issues
                )
            },
            report: Some(AnalysisReport {
                vulnerabilities: all_reports
                    .into_iter()
                    .flat_map(|r| r.vulnerabilities)
                    .collect(),
                warnings: Vec::new(),
                suggestions: Vec::new(),
            }),
            summary: Some(summary),
        };

        // Send results to CI provider
        self.send_results(&result).await?;

        Ok(result)
    }

    async fn send_results(&self, result: &CiResult) -> Result<(), String> {
        match &self.config.provider {
            CiProvider::GitHub => self.send_to_github(result).await,
            CiProvider::GitLab => self.send_to_gitlab(result).await,
            CiProvider::Bitbucket => self.send_to_bitbucket(result).await,
            CiProvider::Jenkins => self.send_to_jenkins(result).await,
            CiProvider::CircleCI => self.send_to_circleci(result).await,
            CiProvider::Custom(_) => self.send_to_custom(result).await,
        }
    }

    async fn send_to_github(&self, result: &CiResult) -> Result<(), String> {
        // Implement GitHub API integration
        Ok(())
    }

    async fn send_to_gitlab(&self, result: &CiResult) -> Result<(), String> {
        // Implement GitLab API integration
        Ok(())
    }

    async fn send_to_bitbucket(&self, result: &CiResult) -> Result<(), String> {
        // Implement Bitbucket API integration
        Ok(())
    }

    async fn send_to_jenkins(&self, result: &CiResult) -> Result<(), String> {
        // Implement Jenkins API integration
        Ok(())
    }

    async fn send_to_circleci(&self, result: &CiResult) -> Result<(), String> {
        // Implement CircleCI API integration
        Ok(())
    }

    async fn send_to_custom(&self, result: &CiResult) -> Result<(), String> {
        if let Some(webhook_url) = &self.config.webhook_url {
            // Implement custom webhook integration
            Ok(())
        } else {
            Err("No webhook URL configured for custom CI provider".to_string())
        }
    }
} 