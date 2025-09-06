use serde::{Deserialize, Serialize};
use tauri::{command, AppHandle, Emitter, Manager};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Settings {
    pub version: u32,
    pub db_path: Option<String>,
    pub theme: String,
}

pub mod logic {
    use super::Settings;
    use chrono::Local;
    use rusqlite::Connection;
    use serde::{Deserialize, Serialize};
    use std::fs;
    use std::path::{Path, PathBuf};

    pub fn default_settings() -> Settings {
        Settings {
            version: 1,
            db_path: None,
            theme: "system".to_string(),
        }
    }

    fn get_settings_path(app_dir: &Path) -> PathBuf {
        app_dir.join("settings.json")
    }

    pub fn read_settings(app_dir: &Path) -> Result<Settings, String> {
        let settings_path = get_settings_path(app_dir);
        if !settings_path.exists() {
            return Ok(default_settings());
        }

        let content = fs::read_to_string(settings_path).map_err(|e| e.to_string())?;
        let mut settings: Settings = serde_json::from_str(&content).map_err(|e| e.to_string())?;

        if settings.version < 1 {
            settings.version = 1;
        }

        Ok(settings)
    }

    pub fn write_settings(app_dir: &Path, settings: &Settings) -> Result<(), String> {
        if !app_dir.exists() {
            fs::create_dir_all(app_dir).map_err(|e| e.to_string())?;
        }
        let settings_path = get_settings_path(app_dir);
        let content = serde_json::to_string_pretty(settings).map_err(|e| e.to_string())?;
        fs::write(settings_path, content).map_err(|e| e.to_string())?;
        Ok(())
    }

    #[derive(Debug, Serialize, Deserialize, Clone)]
    pub struct ValidationResult {
        pub ok: bool,
        pub message: String,
    }

    pub fn validate_db(path: &str) -> ValidationResult {
        match Connection::open(path) {
            Ok(conn) => {
                match conn.query_row("PRAGMA user_version;", [], |row| row.get::<_, i32>(0)) {
                    Ok(_) => ValidationResult {
                        ok: true,
                        message: "Database connection successful.".to_string(),
                    },
                    Err(e) => ValidationResult {
                        ok: false,
                        message: format!("Failed to query database: {}", e),
                    },
                }
            }
            Err(e) => ValidationResult {
                ok: false,
                message: format!("Failed to open database: {}", e),
            },
        }
    }

    #[derive(Debug, Serialize, Deserialize, Clone)]
    pub struct BackupResult {
        pub ok: bool,
        pub message: String,
        pub path: Option<String>,
    }

    fn get_backup_dir(app_dir: &Path) -> Result<PathBuf, String> {
        let backup_dir = app_dir.join("backups");
        if !backup_dir.exists() {
            fs::create_dir_all(&backup_dir).map_err(|e| e.to_string())?;
        }
        Ok(backup_dir)
    }

    pub fn backup_db(app_dir: &Path, db_path: &str) -> BackupResult {
        let db_path_obj = Path::new(db_path);
        if !db_path_obj.exists() {
            return BackupResult {
                ok: false,
                message: "Database file not found at specified path.".to_string(),
                path: None,
            };
        }

        let backup_dir = match get_backup_dir(app_dir) {
            Ok(dir) => dir,
            Err(e) => return BackupResult { ok: false, message: e, path: None },
        };

        let timestamp = Local::now().format("%Y-%m-%d_%H-%M-%S");
        let backup_filename = format!(
            "{}_{}.bak",
            db_path_obj
                .file_stem()
                .unwrap_or_default()
                .to_string_lossy(),
            timestamp
        );
        let backup_path = backup_dir.join(backup_filename);

        match fs::copy(db_path_obj, &backup_path) {
            Ok(_) => BackupResult {
                ok: true,
                message: "Database backup created successfully.".to_string(),
                path: Some(backup_path.to_string_lossy().to_string()),
            },
            Err(e) => BackupResult {
                ok: false,
                message: format!("Failed to create backup: {}", e),
                path: None,
            },
        }
    }
}

fn get_app_dir(app: &AppHandle) -> Result<std::path::PathBuf, String> {
    let config_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?;
    let app_dir = config_dir.join("RefForge");
    if !app_dir.exists() {
        std::fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
    }
    Ok(app_dir)
}

#[command]
pub fn get_settings(app: AppHandle) -> Result<Settings, String> {
    let app_dir = get_app_dir(&app)?;
    logic::read_settings(&app_dir)
}

#[command]
pub fn set_settings(app: AppHandle, settings: Settings) -> Result<(), String> {
    let app_dir = get_app_dir(&app)?;

    let old_settings = logic::read_settings(&app_dir).unwrap_or(logic::default_settings());

    logic::write_settings(&app_dir, &settings)?;
    app.emit("settings-updated", &settings)
        .map_err(|e| e.to_string())?;

    if old_settings.db_path != settings.db_path {
        app.restart();
    }

    Ok(())
}

#[command]
pub fn validate_db(path: String) -> logic::ValidationResult {
    logic::validate_db(&path)
}

#[command]
pub fn backup_db(app: AppHandle, path: String) -> logic::BackupResult {
    let app_dir = match get_app_dir(&app) {
        Ok(dir) => dir,
        Err(e) => return logic::BackupResult { ok: false, message: e, path: None },
    };
    logic::backup_db(&app_dir, &path)
}

#[cfg(test)]
mod tests {
    use super::logic::*;
    use super::Settings;
    use std::fs;
    use std::path::Path;
    use tempfile::{tempdir, NamedTempFile};

    #[test]
    fn test_validate_db_valid() {
        let temp_file = NamedTempFile::new().unwrap();
        let conn = rusqlite::Connection::open(temp_file.path()).unwrap();
        conn.execute("PRAGMA user_version = 1;", []).unwrap();
        conn.close().unwrap();

        let result = validate_db(temp_file.path().to_str().unwrap());
        assert!(result.ok);
        assert_eq!(result.message, "Database connection successful.");
    }

    #[test]
    fn test_validate_db_invalid() {
        let result = validate_db("/path/to/nonexistent/db");
        assert!(!result.ok);
        assert!(result.message.contains("Failed to open database"));
    }

    #[test]
    fn test_validate_db_not_a_db() {
        let temp_file = NamedTempFile::new().unwrap();
        fs::write(temp_file.path(), "not a database").unwrap();
        let result = validate_db(temp_file.path().to_str().unwrap());
        assert!(!result.ok);
        assert!(result.message.contains("file is not a database") || result.message.contains("not a database"));
    }

    #[test]
    fn test_read_write_settings() {
        let temp_dir = tempdir().unwrap();
        let app_dir = temp_dir.path().join("RefForge");

        let settings1 = read_settings(&app_dir).unwrap();
        assert_eq!(settings1.version, 1);
        assert_eq!(settings1.theme, "system");
        assert!(settings1.db_path.is_none());

        let new_settings = Settings {
            version: 1,
            db_path: Some("/path/to/db.sqlite".to_string()),
            theme: "dark".to_string(),
        };
        write_settings(&app_dir, &new_settings).unwrap();

        let settings2 = read_settings(&app_dir).unwrap();
        assert_eq!(
            settings2.db_path,
            Some("/path/to/db.sqlite".to_string())
        );
        assert_eq!(settings2.theme, "dark");
    }

    #[test]
    fn test_settings_migration() {
        let temp_dir = tempdir().unwrap();
        let app_dir = temp_dir.path().join("RefForge");
        fs::create_dir_all(&app_dir).unwrap();

        let old_settings_content = r#"{"version": 0, "db_path": null, "theme": "light"}"#;
        fs::write(app_dir.join("settings.json"), old_settings_content).unwrap();

        let settings = read_settings(&app_dir).unwrap();
        assert_eq!(settings.version, 1);
        assert_eq!(settings.theme, "light");

        write_settings(&app_dir, &settings).unwrap();
        let settings_after_write = read_settings(&app_dir).unwrap();
        assert_eq!(settings_after_write.version, 1);
    }

    #[test]
    fn test_backup_db() {
        let temp_dir = tempdir().unwrap();
        let app_dir = temp_dir.path().join("RefForge");

        let db_file = temp_dir.path().join("test.db");
        fs::write(&db_file, "some db data").unwrap();

        let result = backup_db(&app_dir, db_file.to_str().unwrap());
        assert!(result.ok);
        assert!(result.path.is_some());
        let backup_path_str = result.path.unwrap();
        let backup_path = Path::new(&backup_path_str);
        assert!(backup_path.exists());
        assert!(backup_path
            .file_name()
            .unwrap()
            .to_str()
            .unwrap()
            .contains("test_"));
        assert!(backup_path
            .file_name()
            .unwrap()
            .to_str()
            .unwrap()
            .ends_with(".bak"));

        let content = fs::read_to_string(backup_path).unwrap();
        assert_eq!(content, "some db data");
    }

    #[test]
    fn test_backup_db_not_found() {
        let temp_dir = tempdir().unwrap();
        let app_dir = temp_dir.path().join("RefForge");
        let result = backup_db(&app_dir, "/non/existent/file.db");
        assert!(!result.ok);
        assert_eq!(
            result.message,
            "Database file not found at specified path."
        );
    }
}
