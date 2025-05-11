pub mod analyzer;
pub mod rules;
pub mod utils;
pub mod error;
pub mod types;

use std::path::Path;
use anyhow::Result;

/// Main entry point for analyzing Solana programs
pub struct SolGuard {
    // Configuration and state will go here
}

impl SolGuard {
    pub fn new() -> Self {
        Self {}
    }

    /// Analyze a Solana program at the given path
    pub fn analyze_program(&self, path: &Path) -> Result<AnalysisReport> {
        // Implementation will go here
        todo!()
    }
}

/// Report containing analysis results
#[derive(Debug, serde::Serialize)]
pub struct AnalysisReport {
    pub vulnerabilities: Vec<Vulnerability>,
    pub warnings: Vec<Warning>,
    pub suggestions: Vec<Suggestion>,
}

#[derive(Debug, serde::Serialize)]
pub struct Vulnerability {
    pub severity: Severity,
    pub title: String,
    pub description: String,
    pub location: Location,
    pub recommendation: String,
}

#[derive(Debug, serde::Serialize)]
pub struct Warning {
    pub title: String,
    pub description: String,
    pub location: Location,
}

#[derive(Debug, serde::Serialize)]
pub struct Suggestion {
    pub title: String,
    pub description: String,
    pub location: Location,
}

#[derive(Debug, serde::Serialize)]
pub struct Location {
    pub file: String,
    pub line: usize,
    pub column: usize,
}

#[derive(Debug, serde::Serialize)]
pub enum Severity {
    Critical,
    High,
    Medium,
    Low,
    Info,
} 