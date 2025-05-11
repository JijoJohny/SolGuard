use std::path::Path;
use anyhow::Result;
use syn::File;
use walkdir::WalkDir;

use crate::rules::RuleSet;
use crate::types::{AnalysisReport, Vulnerability, Warning, Suggestion};

pub struct Analyzer {
    rule_set: RuleSet,
}

impl Analyzer {
    pub fn new() -> Self {
        Self {
            rule_set: RuleSet::new(),
        }
    }

    pub fn analyze_directory(&self, path: &Path) -> Result<AnalysisReport> {
        let mut vulnerabilities = Vec::new();
        let mut warnings = Vec::new();
        let mut suggestions = Vec::new();

        // Walk through all Rust files in the directory
        for entry in WalkDir::new(path)
            .into_iter()
            .filter_map(|e| e.ok())
            .filter(|e| e.path().extension().map_or(false, |ext| ext == "rs"))
        {
            let file_path = entry.path();
            let content = std::fs::read_to_string(file_path)?;
            
            // Parse the Rust file
            let ast = syn::parse_file(&content)?;
            
            // Run all security rules
            let file_vulnerabilities = self.rule_set.analyze(&ast);
            
            // Add file path to vulnerabilities
            vulnerabilities.extend(file_vulnerabilities.into_iter().map(|mut v| {
                v.location.file = file_path.to_string_lossy().into_owned();
                v
            }));
        }

        Ok(AnalysisReport {
            vulnerabilities,
            warnings,
            suggestions,
        })
    }

    pub fn analyze_file(&self, path: &Path) -> Result<AnalysisReport> {
        let content = std::fs::read_to_string(path)?;
        let ast = syn::parse_file(&content)?;
        
        let vulnerabilities = self.rule_set.analyze(&ast);
        
        Ok(AnalysisReport {
            vulnerabilities,
            warnings: Vec::new(),
            suggestions: Vec::new(),
        })
    }
} 