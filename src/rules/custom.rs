use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use syn::{File, ItemFn, Attribute};
use regex::Regex;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CustomRule {
    pub id: String,
    pub name: String,
    pub description: String,
    pub severity: RuleSeverity,
    pub pattern: String,
    pub message: String,
    pub enabled: bool,
    pub created_by: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum RuleSeverity {
    Critical,
    High,
    Medium,
    Low,
    Info,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RuleMatch {
    pub rule_id: String,
    pub file_path: String,
    pub line: usize,
    pub column: usize,
    pub message: String,
    pub severity: RuleSeverity,
    pub context: String,
}

pub struct CustomRuleEngine {
    rules: HashMap<String, CustomRule>,
    patterns: HashMap<String, Regex>,
}

impl CustomRuleEngine {
    pub fn new() -> Self {
        Self {
            rules: HashMap::new(),
            patterns: HashMap::new(),
        }
    }

    pub fn add_rule(&mut self, rule: CustomRule) -> Result<(), String> {
        // Validate pattern
        let pattern = Regex::new(&rule.pattern)
            .map_err(|e| format!("Invalid regex pattern: {}", e))?;

        self.patterns.insert(rule.id.clone(), pattern);
        self.rules.insert(rule.id.clone(), rule);
        Ok(())
    }

    pub fn remove_rule(&mut self, rule_id: &str) {
        self.rules.remove(rule_id);
        self.patterns.remove(rule_id);
    }

    pub fn update_rule(&mut self, rule: CustomRule) -> Result<(), String> {
        self.remove_rule(&rule.id);
        self.add_rule(rule)
    }

    pub fn analyze_file(&self, file_path: &str, content: &str) -> Vec<RuleMatch> {
        let mut matches = Vec::new();

        for (rule_id, rule) in &self.rules {
            if !rule.enabled {
                continue;
            }

            if let Some(pattern) = self.patterns.get(rule_id) {
                for (line_num, line) in content.lines().enumerate() {
                    if let Some(mat) = pattern.find(line) {
                        matches.push(RuleMatch {
                            rule_id: rule_id.clone(),
                            file_path: file_path.to_string(),
                            line: line_num + 1,
                            column: mat.start() + 1,
                            message: rule.message.clone(),
                            severity: rule.severity.clone(),
                            context: line.to_string(),
                        });
                    }
                }
            }
        }

        matches
    }

    pub fn analyze_ast(&self, file: &File) -> Vec<RuleMatch> {
        let mut matches = Vec::new();

        for item in &file.items {
            if let syn::Item::Fn(func) = item {
                self.analyze_function(func, &mut matches);
            }
        }

        matches
    }

    fn analyze_function(&self, func: &ItemFn, matches: &mut Vec<RuleMatch>) {
        for rule in self.rules.values() {
            if !rule.enabled {
                continue;
            }

            if let Some(pattern) = self.patterns.get(&rule.id) {
                // Analyze function attributes
                for attr in &func.attrs {
                    if self.analyze_attribute(attr, pattern, rule, matches) {
                        continue;
                    }
                }

                // Analyze function signature
                let sig_str = quote::quote!(#func.sig).to_string();
                if pattern.is_match(&sig_str) {
                    matches.push(RuleMatch {
                        rule_id: rule.id.clone(),
                        file_path: "unknown".to_string(), // TODO: Get actual file path
                        line: func.sig.span().start().line,
                        column: func.sig.span().start().column,
                        message: rule.message.clone(),
                        severity: rule.severity.clone(),
                        context: sig_str,
                    });
                }
            }
        }
    }

    fn analyze_attribute(
        &self,
        attr: &Attribute,
        pattern: &Regex,
        rule: &CustomRule,
        matches: &mut Vec<RuleMatch>,
    ) -> bool {
        let attr_str = quote::quote!(#attr).to_string();
        if pattern.is_match(&attr_str) {
            matches.push(RuleMatch {
                rule_id: rule.id.clone(),
                file_path: "unknown".to_string(), // TODO: Get actual file path
                line: attr.span().start().line,
                column: attr.span().start().column,
                message: rule.message.clone(),
                severity: rule.severity.clone(),
                context: attr_str,
            });
            true
        } else {
            false
        }
    }
} 