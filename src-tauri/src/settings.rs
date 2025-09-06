use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use chrono::Utc;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Settings {
    pub version: u32,
    pub database_path: String,
    pub theme: String,
    pub last_verified: Option<String>, // ISO string for when DB was last verified
    pub backup_enabled: bool,
    pub max_backups: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ValidationResult {
    pub valid: bool,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BackupResult {
    pub success: bool,
    pub backup_path: Option<String>,
    pub message: String,
}

impl Default for Settings {
    fn default() -> Self {
        Settings {
            version: 1,
            database_path: "refforge.db".to_string(),
            theme: "system".to_string(),
            last_verified: None,
            backup_enabled: true,
            max_backups: 10,
        }
    }
}

pub fn default_settings() -> Settings {
    Settings::default()
}

pub fn get_settings_path() -> Result<PathBuf, Box<dyn std::error::Error>> {
    // For now, use a local settings directory - in production this would be app config dir
    let settings_dir = PathBuf::from("RefForge");
    
    // Ensure directory exists
    if !settings_dir.exists() {
        fs::create_dir_all(&settings_dir)?;
    }
    
    Ok(settings_dir.join("settings.json"))
}

pub fn read_settings(path: Option<PathBuf>) -> Result<Settings, Box<dyn std::error::Error>> {
    let settings_path = match path {
        Some(p) => p,
        None => get_settings_path()?,
    };
    
    if !settings_path.exists() {
        return Ok(default_settings());
    }
    
    let content = fs::read_to_string(&settings_path)?;
    let mut settings: Settings = serde_json::from_str(&content)?;
    
    // Handle version migration
    if settings.version < 1 {
        // Migrate from version 0 to 1 (future use)
        settings.version = 1;
    }
    
    Ok(settings)
}

pub fn write_settings(settings: &Settings) -> Result<(), Box<dyn std::error::Error>> {
    let settings_path = get_settings_path()?;
    
    // Ensure parent directory exists
    if let Some(parent) = settings_path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)?;
        }
    }
    
    let content = serde_json::to_string_pretty(settings)?;
    fs::write(&settings_path, content)?;
    
    Ok(())
}

pub fn validate_db(path: &str) -> ValidationResult {
    if path.is_empty() {
        return ValidationResult {
            valid: false,
            message: "Database path cannot be empty".to_string(),
        };
    }
    
    let db_path = Path::new(path);
    
    // Check if path exists
    if !db_path.exists() {
        return ValidationResult {
            valid: false,
            message: format!("Database file does not exist: {}", path),
        };
    }
    
    // Try to open the database and run a harmless query
    match rusqlite::Connection::open(db_path) {
        Ok(conn) => {
            // Run a harmless PRAGMA command to test the connection
            match conn.pragma_query_value(None, "user_version", |row| {
                Ok(row.get::<_, i32>(0)?)
            }) {
                Ok(_) => ValidationResult {
                    valid: true,
                    message: "Database is valid and accessible".to_string(),
                },
                Err(e) => ValidationResult {
                    valid: false,
                    message: format!("Database validation failed: {}", e),
                },
            }
        },
        Err(e) => ValidationResult {
            valid: false,
            message: format!("Could not open database: {}", e),
        },
    }
}

pub fn backup_db(path: &str) -> Result<BackupResult, Box<dyn std::error::Error>> {
    if path.is_empty() {
        return Ok(BackupResult {
            success: false,
            backup_path: None,
            message: "Database path cannot be empty".to_string(),
        });
    }
    
    let db_path = Path::new(path);
    
    if !db_path.exists() {
        return Ok(BackupResult {
            success: false,
            backup_path: None,
            message: format!("Database file does not exist: {}", path),
        });
    }
    
    // Get backup directory - for now use local directory
    let backup_dir = PathBuf::from("RefForge").join("backups");
    
    // Ensure backup directory exists
    if !backup_dir.exists() {
        fs::create_dir_all(&backup_dir)?;
    }
    
    // Generate timestamped backup filename
    let timestamp = Utc::now().format("%Y%m%d_%H%M%S");
    let db_filename = db_path.file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("database");
    
    let backup_filename = format!("{}_{}.bak", db_filename, timestamp);
    let backup_path = backup_dir.join(backup_filename);
    
    // Copy the database file
    match fs::copy(db_path, &backup_path) {
        Ok(_) => Ok(BackupResult {
            success: true,
            backup_path: Some(backup_path.to_string_lossy().to_string()),
            message: "Database backed up successfully".to_string(),
        }),
        Err(e) => Ok(BackupResult {
            success: false,
            backup_path: None,
            message: format!("Failed to backup database: {}", e),
        }),
    }
}

// Tauri commands
#[tauri::command]
pub fn get_settings() -> Result<Settings, String> {
    read_settings(None).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_settings(settings: Settings) -> Result<(), String> {
    write_settings(&settings).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn validate_database(path: String) -> ValidationResult {
    validate_db(&path)
}

#[tauri::command]
pub fn backup_database(path: String) -> Result<BackupResult, String> {
    backup_db(&path).map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;
    
    #[test]
    fn test_default_settings() {
        let settings = default_settings();
        assert_eq!(settings.version, 1);
        assert_eq!(settings.database_path, "refforge.db");
        assert_eq!(settings.theme, "system");
        assert!(settings.backup_enabled);
        assert_eq!(settings.max_backups, 10);
    }
    
    #[test]
    fn test_read_write_settings() {
        let temp_dir = TempDir::new().unwrap();
        let settings_path = temp_dir.path().join("test_settings.json");
        
        let original_settings = Settings {
            version: 1,
            database_path: "/path/to/test.db".to_string(),
            theme: "dark".to_string(),
            last_verified: Some("2024-01-01T12:00:00Z".to_string()),
            backup_enabled: false,
            max_backups: 5,
        };
        
        // Write settings to specific path
        let content = serde_json::to_string_pretty(&original_settings).unwrap();
        fs::write(&settings_path, content).unwrap();
        
        // Read settings from the specific path
        let read_result = read_settings(Some(settings_path)).unwrap();
        assert_eq!(read_result.version, original_settings.version);
        assert_eq!(read_result.database_path, original_settings.database_path);
        assert_eq!(read_result.theme, original_settings.theme);
        assert_eq!(read_result.backup_enabled, original_settings.backup_enabled);
    }
    
    #[test]
    fn test_validate_db_empty_path() {
        let result = validate_db("");
        assert!(!result.valid);
        assert!(result.message.contains("empty"));
    }
    
    #[test]
    fn test_validate_db_nonexistent_file() {
        let result = validate_db("/nonexistent/path/to/database.db");
        assert!(!result.valid);
        assert!(result.message.contains("does not exist"));
    }
    
    #[test]
    fn test_validate_db_valid_sqlite() {
        let temp_dir = TempDir::new().unwrap();
        let db_path = temp_dir.path().join("test.db");
        
        // Create a valid SQLite database
        let conn = rusqlite::Connection::open(&db_path).unwrap();
        conn.execute(
            "CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)",
            [],
        ).unwrap();
        drop(conn);
        
        let result = validate_db(db_path.to_str().unwrap());
        assert!(result.valid);
        assert!(result.message.contains("valid"));
    }
    
    #[test]
    fn test_backup_db_empty_path() {
        let result = backup_db("").unwrap();
        assert!(!result.success);
        assert!(result.message.contains("empty"));
    }
    
    #[test]
    fn test_backup_db_nonexistent_file() {
        let result = backup_db("/nonexistent/path/to/database.db").unwrap();
        assert!(!result.success);
        assert!(result.message.contains("does not exist"));
    }
}