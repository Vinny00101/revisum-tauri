use tauri::{Manager, async_runtime::block_on};

use crate::db::{config::init_db, migration};
use command::user_command::{create_user_command, authentication_user_command};

mod db;
mod error;
mod repository;
mod service;
mod command;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app|{
            let app_handle = app.handle().clone();
            let state = block_on(init_db(&app_handle))
                .map_err(|e| format!("Falha na inicialização do banco: {}", e))?;
            app_handle.manage(state);
            Ok(())
        })
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:revisum.db", migration::migrations())
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            create_user_command,
            authentication_user_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}