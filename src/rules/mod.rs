use crate::types::{AnalysisReport, Location, Severity, Vulnerability};
use syn::{File, Item};

pub mod ownership;
pub mod pda;
pub mod sysvar;
pub mod arithmetic;
pub mod cpi;
pub mod initialization;

/// Trait for implementing security rules
pub trait SecurityRule {
    fn name(&self) -> &'static str;
    fn description(&self) -> &'static str;
    fn severity(&self) -> Severity;
    
    /// Analyze the given AST and return any found vulnerabilities
    fn analyze(&self, ast: &File) -> Vec<Vulnerability>;
}

/// Collection of all security rules
pub struct RuleSet {
    rules: Vec<Box<dyn SecurityRule>>,
}

impl RuleSet {
    pub fn new() -> Self {
        Self {
            rules: vec![
                Box::new(ownership::MissingOwnerCheck::new()),
                Box::new(ownership::MissingSignerCheck::new()),
                Box::new(pda::PdaValidationError::new()),
                Box::new(sysvar::SysvarSpoofing::new()),
                Box::new(arithmetic::UncheckedArithmetic::new()),
                Box::new(cpi::ArbitraryCpi::new()),
                Box::new(initialization::Reinitialization::new()),
            ],
        }
    }

    pub fn analyze(&self, ast: &File) -> Vec<Vulnerability> {
        let mut vulnerabilities = Vec::new();
        
        for rule in &self.rules {
            vulnerabilities.extend(rule.analyze(ast));
        }
        
        vulnerabilities
    }
} 