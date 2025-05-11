use clap::Parser;
use std::path::PathBuf;
use anyhow::Result;

use solguard::analyzer::Analyzer;

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
struct Cli {
    /// Path to analyze (file or directory)
    #[arg(required = true)]
    path: PathBuf,

    /// Output format (json or text)
    #[arg(short, long, default_value = "text")]
    format: String,

    /// Output file (if not specified, prints to stdout)
    #[arg(short, long)]
    output: Option<PathBuf>,
}

fn main() -> Result<()> {
    let cli = Cli::parse();
    let analyzer = Analyzer::new();

    // Run analysis
    let report = if cli.path.is_dir() {
        analyzer.analyze_directory(&cli.path)?
    } else {
        analyzer.analyze_file(&cli.path)?
    };

    // Format and output results
    let output = match cli.format.as_str() {
        "json" => serde_json::to_string_pretty(&report)?,
        "text" => format_report(&report),
        _ => return Err(anyhow::anyhow!("Unsupported output format")),
    };

    // Write output
    if let Some(output_path) = cli.output {
        std::fs::write(output_path, output)?;
    } else {
        println!("{}", output);
    }

    Ok(())
}

fn format_report(report: &solguard::AnalysisReport) -> String {
    let mut output = String::new();

    // Format vulnerabilities
    if !report.vulnerabilities.is_empty() {
        output.push_str("\nVulnerabilities:\n");
        for vuln in &report.vulnerabilities {
            output.push_str(&format!(
                "\n[{}] {}\nLocation: {}:{}\nDescription: {}\nRecommendation: {}\n",
                vuln.severity.to_string(),
                vuln.title,
                vuln.location.file,
                vuln.location.line,
                vuln.description,
                vuln.recommendation
            ));
        }
    }

    // Format warnings
    if !report.warnings.is_empty() {
        output.push_str("\nWarnings:\n");
        for warning in &report.warnings {
            output.push_str(&format!(
                "\n{}\nLocation: {}:{}\nDescription: {}\n",
                warning.title,
                warning.location.file,
                warning.location.line,
                warning.description
            ));
        }
    }

    // Format suggestions
    if !report.suggestions.is_empty() {
        output.push_str("\nSuggestions:\n");
        for suggestion in &report.suggestions {
            output.push_str(&format!(
                "\n{}\nLocation: {}:{}\nDescription: {}\n",
                suggestion.title,
                suggestion.location.file,
                suggestion.location.line,
                suggestion.description
            ));
        }
    }

    output
} 