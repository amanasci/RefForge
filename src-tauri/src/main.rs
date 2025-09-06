// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod settings;

use settings::{backup_db, get_settings, set_settings, validate_db};
use tauri_plugin_sql::{Migration, MigrationKind};
use std::path::PathBuf;

fn get_config_path() -> Option<PathBuf> {
    dirs::config_dir().map(|p| p.join("RefForge"))
}

fn get_default_db_path() -> Option<PathBuf> {
    dirs::data_dir().map(|p| p.join("RefForge").join("refforge.db"))
}

fn main() {
    let settings = if let Some(config_path) = get_config_path() {
        if !config_path.exists() {
            std::fs::create_dir_all(&config_path).unwrap();
        }
        settings::logic::read_settings(&config_path).unwrap_or_else(|_| settings::logic::default_settings())
    } else {
        settings::logic::default_settings()
    };

    let db_path_str = settings.db_path.unwrap_or_else(|| {
        get_default_db_path().unwrap().to_string_lossy().to_string()
    });

    let db_url = format!("sqlite:{}", db_path_str);

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

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(&db_url, migrations)
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            get_settings,
            set_settings,
            validate_db,
            backup_db
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
