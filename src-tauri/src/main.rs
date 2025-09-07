// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_sql::{Migration, MigrationKind};

mod settings;
use settings::Settings;

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
            restart_app
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
