// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_sql::{Migration, MigrationKind};
use reqwest;

mod settings;
use settings::Settings;

fn normalize_arxiv_id(input: &str) -> Option<String> {
    let mut id = input.trim().to_string();
    let lower = id.to_lowercase();

    if let Some(idx) = lower.find("id_list=") {
        id = id[idx + "id_list=".len()..].to_string();
    } else if lower.starts_with("https://doi.org/") {
        id = id["https://doi.org/".len()..].to_string();
    } else if lower.starts_with("http://doi.org/") {
        id = id["http://doi.org/".len()..].to_string();
    } else if lower.starts_with("10.48550/") {
        id = id["10.48550/".len()..].to_string();
    } else if lower.starts_with("https://arxiv.org/abs/") {
        id = id["https://arxiv.org/abs/".len()..].to_string();
    } else if lower.starts_with("http://arxiv.org/abs/") {
        id = id["http://arxiv.org/abs/".len()..].to_string();
    } else if lower.starts_with("https://arxiv.org/pdf/") {
        id = id["https://arxiv.org/pdf/".len()..].to_string();
    } else if lower.starts_with("http://arxiv.org/pdf/") {
        id = id["http://arxiv.org/pdf/".len()..].to_string();
    } else if lower.starts_with("arxiv:") {
        id = id["arxiv:".len()..].to_string();
    } else if lower.starts_with("arxiv.") {
        id = id["arxiv.".len()..].to_string();
    }

    id = id.split('?').next().unwrap_or(&id).trim().to_string();
    id = id.replace(' ', "");
    if id.is_empty() {
        return None;
    }

    // Keep only the core ID form if extra prefixes remain.
    if let Some(start) = id.to_lowercase().find("arxiv.") {
        id = id[start + "arxiv.".len()..].to_string();
    }

    let normalized = id.trim().to_string();
    if normalized.is_empty() {
        None
    } else {
        Some(normalized)
    }
}

#[tauri::command]
async fn fetch_arxiv_xml(doi: String) -> Result<String, String> {
    let arxiv_id = normalize_arxiv_id(&doi).ok_or_else(|| "Invalid arXiv identifier".to_string())?;
    let url = format!("https://export.arxiv.org/api/query?id_list={}", arxiv_id);
    let response = reqwest::get(url).await.map_err(|e| e.to_string())?;
    if !response.status().is_success() {
        return Err(format!("arXiv request failed with status {}", response.status()));
    }
    response.text().await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_settings() -> Result<Settings, String> {
    Settings::load()
}

#[tauri::command]
async fn set_settings(settings: Settings) -> Result<(), String> {
    settings.save()
}

#[tauri::command]
async fn get_default_db_path() -> Result<String, String> {
    Settings::get_default_db_path()
}

#[tauri::command]
async fn get_default_db_folder() -> Result<String, String> {
    Settings::get_default_db_folder()
}

#[tauri::command]
async fn get_db_path() -> Result<String, String> {
    let settings = Settings::load()?;
    settings.get_db_path()
}

#[tauri::command]
async fn restart_app(app_handle: tauri::AppHandle) -> Result<(), String> {
    app_handle.restart();
    // This is unreachable but required for the function signature
    #[allow(unreachable_code)]
    Ok(())
}

fn main() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: "
                CREATE TABLE projects (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    color TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS `references` (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    authors TEXT NOT NULL,
                    year INTEGER NOT NULL,
                    journal TEXT,
                    doi TEXT,
                    `abstract` TEXT NOT NULL,
                    tags TEXT NOT NULL,
                    priority INTEGER NOT NULL DEFAULT 0,
                    project_id TEXT NOT NULL,
                    created_at DATETIME NOT NULL,
                    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
                );
            ",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "add_notes_to_references",
            sql: "ALTER TABLE `references` ADD COLUMN notes TEXT;",
            kind: MigrationKind::Up,
        },
    ];

    // Load settings to get the database path
    let settings = Settings::load().unwrap_or_default();
    let db_path = settings.get_db_path().unwrap_or_else(|_| "sqlite:refforge.db".to_string());

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(&db_path, migrations)
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            get_settings,
            set_settings,
            get_default_db_path,
            get_default_db_folder,
            get_db_path,
            fetch_arxiv_xml,
            restart_app
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
