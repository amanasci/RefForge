use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::fs;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Settings {
    pub version: u32,
    pub db_path: Option<String>,
    pub theme: String,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            version: 1,
            db_path: None,
            theme: "system".to_string(),
        }
    }
}

impl Settings {
    pub fn get_config_path() -> Result<PathBuf, String> {
        dirs::config_dir()
            .map(|dir| dir.join("RefForge").join("settings.json"))
            .ok_or_else(|| "Failed to get config directory".to_string())
    }

    pub fn get_default_db_path() -> Result<String, String> {
        dirs::data_local_dir()
            .map(|dir| dir.join("RefForge").join("refforge.db").to_string_lossy().to_string())
            .ok_or_else(|| "Failed to get data directory".to_string())
    }

    pub fn load() -> Result<Settings, String> {
        let config_path = Self::get_config_path()?;
        
        if !config_path.exists() {
            return Ok(Settings::default());
        }

        let content = fs::read_to_string(&config_path)
            .map_err(|e| format!("Failed to read settings file: {}", e))?;

        let settings: Settings = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse settings file: {}", e))?;

        Ok(settings)
    }

    pub fn save(&self) -> Result<(), String> {
        let config_path = Self::get_config_path()?;
        
        // Create parent directory if it doesn't exist
        if let Some(parent) = config_path.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create config directory: {}", e))?;
        }

        let content = serde_json::to_string_pretty(self)
            .map_err(|e| format!("Failed to serialize settings: {}", e))?;

        fs::write(&config_path, content)
            .map_err(|e| format!("Failed to write settings file: {}", e))?;

        Ok(())
    }

    pub fn get_db_path(&self) -> Result<String, String> {
        match &self.db_path {
            Some(path) => Ok(format!("sqlite:{}", path)),
            None => {
                let default_path = Self::get_default_db_path()?;
                // Ensure the parent directory exists
                let path_buf = PathBuf::from(&default_path);
                if let Some(parent) = path_buf.parent() {
                    fs::create_dir_all(parent)
                        .map_err(|e| format!("Failed to create database directory: {}", e))?;
                }
                Ok(format!("sqlite:{}", default_path))
            }
        }
    }
}