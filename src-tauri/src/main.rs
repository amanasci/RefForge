// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod settings;

use settings::{backup_db, get_settings, set_settings, validate_db};
use tauri_plugin_sql::{Migration, MigrationKind};

fn prepare_db_url() -> Result<String, Box<dyn std::error::Error>> {
    let config_dir = dirs::config_dir().ok_or("Could not find config directory")?.join("RefForge");
    if !config_dir.exists() {
        std::fs::create_dir_all(&config_dir)?;
    }

    let settings = settings::logic::read_settings(&config_dir).unwrap_or_else(|_| settings::logic::default_settings());

    let db_path_str = match settings.db_path {
        Some(path) => path,
        None => {
            let data_dir = dirs::data_dir().ok_or("Could not find data directory")?.join("RefForge");
            if !data_dir.exists() {
                std::fs::create_dir_all(&data_dir)?;
            }
            let default_path = data_dir.join("refforge.db");
            // Also save this default path to settings for consistency
            let mut new_settings = settings::logic::default_settings();
            new_settings.db_path = Some(default_path.to_string_lossy().to_string());
            settings::logic::write_settings(&config_dir, &new_settings)?;

            default_path.to_string_lossy().to_string()
        }
    };

    Ok(format!("sqlite:{}", db_path_str))
}


fn main() {
    let db_url = prepare_db_url().expect("Failed to prepare database URL");
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
