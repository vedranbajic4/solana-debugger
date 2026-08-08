use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

use super::anchor::{SourceContext, SourceLine};

/// Attempts to resolve and read source code for a given DWARF file path and error line.
pub struct SourceFetcher;

impl SourceFetcher {
    /// Try to find and read source code, returning a SourceContext with lines around the error.
    /// Tries multiple resolution strategies in order:
    /// 1. Absolute path from DWARF
    /// 2. Relative to workspace root
    /// 3. Common Anchor project layouts
    pub fn fetch_source_context(
        file_path: &str,
        error_line: u64,
        workspace_root: Option<&str>,
        program_id: Option<&str>,
    ) -> SourceContext {
        // Try to find the actual source file locally first, then fallback to external registry
        let source_text_opt = Self::resolve_and_read(file_path, workspace_root)
            .or_else(|| Self::fetch_from_verified_registry(program_id, file_path));

        if let Some(source_text) = source_text_opt {
            let lines: Vec<&str> = source_text.lines().collect();
            let total_lines = lines.len() as u64;

            if error_line == 0 || error_line > total_lines {
                return SourceContext {
                    available: true,
                    file_name: Some(Self::short_file_name(file_path)),
                    error_line: Some(error_line),
                    source_lines: Vec::new(),
                };
            }

            // Extract a window of ±10 lines around the error
            let window_start = if error_line > 10 { error_line - 10 } else { 1 };
            let window_end = (error_line + 10).min(total_lines);

            let mut source_lines = Vec::new();
            for line_num in window_start..=window_end {
                let idx = (line_num - 1) as usize;
                if idx < lines.len() {
                    source_lines.push(SourceLine {
                        line: line_num,
                        text: lines[idx].to_string(),
                        is_error: if line_num == error_line {
                            Some(true)
                        } else {
                            None
                        },
                    });
                }
            }

            return SourceContext {
                available: true,
                file_name: Some(Self::short_file_name(file_path)),
                error_line: Some(error_line),
                source_lines,
            };
        }

        // Source not available
        SourceContext {
            available: false,
            file_name: Some(Self::short_file_name(file_path)),
            error_line: Some(error_line),
            source_lines: Vec::new(),
        }
    }

    /// Try multiple file resolution strategies to find the source file on disk.
    fn resolve_and_read(file_path: &str, workspace_root: Option<&str>) -> Option<String> {
        // Strategy 1: Absolute path as-is
        if Path::new(file_path).is_absolute() {
            if let Ok(content) = fs::read_to_string(file_path) {
                return Some(content);
            }
        }

        // Strategy 2: Relative to workspace root
        if let Some(root) = workspace_root {
            let candidate = PathBuf::from(root).join(file_path);
            if let Ok(content) = fs::read_to_string(&candidate) {
                return Some(content);
            }

            // Strategy 3: Strip common build path prefixes
            // DWARF paths often contain build directory prefixes like:
            //   /home/user/.cargo/registry/src/.../src/lib.rs
            //   programs/my_program/src/lib.rs
            //   src/lib.rs
            let stripped_paths = Self::strip_common_prefixes(file_path);
            for stripped in &stripped_paths {
                let candidate = PathBuf::from(root).join(stripped);
                if let Ok(content) = fs::read_to_string(&candidate) {
                    return Some(content);
                }
            }

            // Strategy 4: Walk common Anchor project layouts
            let anchor_dirs = ["programs", "src", "app/src"];
            for dir in &anchor_dirs {
                let base = PathBuf::from(root).join(dir);
                if base.is_dir() {
                    if let Some(content) = Self::search_dir_recursive(&base, file_path) {
                        return Some(content);
                    }
                }
            }
        }

        None
    }

    /// Strip common build path prefixes to get a relative source path.
    fn strip_common_prefixes(file_path: &str) -> Vec<String> {
        let mut results = Vec::new();

        // Strip everything before the LAST "src/" if present
        if let Some(pos) = file_path.rfind("/src/") {
            results.push(file_path[pos + 1..].to_string());
        }

        // Strip everything before "programs/" if present
        if let Some(pos) = file_path.rfind("/programs/") {
            results.push(file_path[pos + 1..].to_string());
        }

        // Just the filename
        if let Some(filename) = Path::new(file_path).file_name() {
            results.push(filename.to_string_lossy().to_string());
        }

        results
    }

    /// Recursively search a directory for a file matching the tail of the DWARF path.
    fn search_dir_recursive(dir: &Path, target_file: &str) -> Option<String> {
        let target_name = Path::new(target_file)
            .file_name()?
            .to_string_lossy()
            .to_string();

        Self::walk_dir(dir, &target_name)
    }

    fn walk_dir(dir: &Path, target_name: &str) -> Option<String> {
        let entries = fs::read_dir(dir).ok()?;
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_file() {
                if let Some(name) = path.file_name() {
                    if name.to_string_lossy() == target_name {
                        return fs::read_to_string(&path).ok();
                    }
                }
            } else if path.is_dir() {
                // Skip hidden dirs and target/node_modules
                let dir_name = path.file_name()?.to_string_lossy().to_string();
                if dir_name.starts_with('.') || dir_name == "target" || dir_name == "node_modules" {
                    continue;
                }
                if let Some(content) = Self::walk_dir(&path, target_name) {
                    return Some(content);
                }
            }
        }
        None
    }

    /// Extract a short, human-readable file name from a potentially long DWARF path.
    fn short_file_name(file_path: &str) -> String {
        // Try to keep "programs/foo/src/lib.rs" style paths
        if let Some(pos) = file_path.rfind("/programs/") {
            return file_path[pos + 1..].to_string();
        }
        // Use rfind to get the LAST /src/ (avoids cargo registry intermediate src/ dirs)
        if let Some(pos) = file_path.rfind("/src/") {
            return file_path[pos + 1..].to_string();
        }
        // Just the filename
        Path::new(file_path)
            .file_name()
            .map(|f| f.to_string_lossy().to_string())
            .unwrap_or_else(|| file_path.to_string())
    }

    /// Fetches source code from verified registries (like OtterSec or Github Raw)
    fn fetch_from_verified_registry(program_id: Option<&str>, file_path: &str) -> Option<String> {
        let pid = program_id?;
        
        // 1. Check OtterSec verify API for the program's repo
        let verify_url = format!("https://verify.osec.io/status/{}", pid);
        
        if let Ok(response) = reqwest::blocking::get(&verify_url) {
            if let Ok(json) = response.json::<serde_json::Value>() {
                if let Some(repo_url) = json.get("repo_url").and_then(|v| v.as_str()) {
                    if let Some(commit) = json.get("commit").and_then(|v| v.as_str()) {
                        
                        // Convert GitHub URL to raw.githubusercontent.com URL
                        // E.g., https://github.com/coral-xyz/anchor -> https://raw.githubusercontent.com/coral-xyz/anchor/{commit}/...
                        if repo_url.starts_with("https://github.com/") {
                            let raw_base = repo_url.replace("https://github.com/", "https://raw.githubusercontent.com/");
                            
                            // Get the shortest relative path from the DWARF path
                            let stripped_paths = Self::strip_common_prefixes(file_path);
                            
                            for relative_path in stripped_paths {
                                let raw_url = format!("{}/{}/{}", raw_base, commit, relative_path);
                                
                                if let Ok(src_resp) = reqwest::blocking::get(&raw_url) {
                                    if src_resp.status().is_success() {
                                        if let Ok(text) = src_resp.text() {
                                            return Some(text);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_short_file_name() {
        assert_eq!(
            SourceFetcher::short_file_name("/home/user/project/programs/my_program/src/lib.rs"),
            "programs/my_program/src/lib.rs"
        );
        assert_eq!(
            SourceFetcher::short_file_name("/home/user/project/src/processor.rs"),
            "src/processor.rs"
        );
        assert_eq!(
            SourceFetcher::short_file_name("lib.rs"),
            "lib.rs"
        );
    }

    #[test]
    fn test_strip_common_prefixes() {
        let results = SourceFetcher::strip_common_prefixes(
            "/home/user/.cargo/registry/src/index.crates.io/solana-program-1.18.0/src/lib.rs",
        );
        assert!(results.contains(&"src/lib.rs".to_string()));
        assert!(results.contains(&"lib.rs".to_string()));
    }

    #[test]
    fn test_unavailable_source() {
        let ctx = SourceFetcher::fetch_source_context(
            "/nonexistent/path/src/lib.rs",
            42,
            None,
            None,
        );
        assert!(!ctx.available);
        assert_eq!(ctx.error_line, Some(42));
    }
}
