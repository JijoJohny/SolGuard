use crate::types::{Location, Severity, Vulnerability};
use crate::rules::SecurityRule;
use syn::{File, Item, Expr, Pat, Stmt};
use quote::ToTokens;

pub struct MissingOwnerCheck {
    name: &'static str,
    description: &'static str,
    severity: Severity,
}

impl MissingOwnerCheck {
    pub fn new() -> Self {
        Self {
            name: "Missing Owner Check",
            description: "Account ownership is not verified before use",
            severity: Severity::High,
        }
    }
}

impl SecurityRule for MissingOwnerCheck {
    fn name(&self) -> &'static str {
        self.name
    }

    fn description(&self) -> &'static str {
        self.description
    }

    fn severity(&self) -> Severity {
        self.severity
    }

    fn analyze(&self, ast: &File) -> Vec<Vulnerability> {
        let mut vulnerabilities = Vec::new();
        
        // Walk through the AST looking for account usage without owner checks
        for item in &ast.items {
            if let Item::Fn(func) = item {
                // Look for account parameters
                for param in &func.sig.inputs {
                    if let syn::FnArg::Typed(pat_type) = param {
                        // Check if this is an AccountInfo type
                        if let syn::Type::Path(type_path) = &*pat_type.ty {
                            if type_path.path.is_ident("AccountInfo") {
                                // Look for owner checks in the function body
                                if let Some(body) = &func.block {
                                    let has_owner_check = body.stmts.iter().any(|stmt| {
                                        if let Stmt::Expr(expr) = stmt {
                                            // Look for owner checks like account.owner == program_id
                                            if let Expr::Binary(binary) = expr {
                                                if let Expr::Path(path) = &*binary.left {
                                                    if path.path.is_ident("owner") {
                                                        return true;
                                                    }
                                                }
                                            }
                                        }
                                        false
                                    });

                                    if !has_owner_check {
                                        vulnerabilities.push(Vulnerability {
                                            severity: self.severity,
                                            title: self.name.to_string(),
                                            description: format!(
                                                "Account ownership is not verified in function {}",
                                                func.sig.ident
                                            ),
                                            location: Location {
                                                file: "unknown".to_string(), // TODO: Get actual file
                                                line: 0, // TODO: Get actual line
                                                column: 0, // TODO: Get actual column
                                            },
                                            recommendation: "Always verify account ownership using account.owner == program_id".to_string(),
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        vulnerabilities
    }
}

pub struct MissingSignerCheck {
    name: &'static str,
    description: &'static str,
    severity: Severity,
}

impl MissingSignerCheck {
    pub fn new() -> Self {
        Self {
            name: "Missing Signer Check",
            description: "Account signer status is not verified before use",
            severity: Severity::High,
        }
    }
}

impl SecurityRule for MissingSignerCheck {
    fn name(&self) -> &'static str {
        self.name
    }

    fn description(&self) -> &'static str {
        self.description
    }

    fn severity(&self) -> Severity {
        self.severity
    }

    fn analyze(&self, ast: &File) -> Vec<Vulnerability> {
        let mut vulnerabilities = Vec::new();
        
        // Similar implementation to MissingOwnerCheck but looking for is_signer checks
        // TODO: Implement signer check analysis
        
        vulnerabilities
    }
} 