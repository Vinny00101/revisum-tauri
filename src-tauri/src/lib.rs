use tauri::{async_runtime::block_on, Manager};

use crate::{db::{config::init_db, migration}, filesystem::init_directories};
use command::{
    user_command::{
        authentication_user_command, 
        create_user_command,
        update_user_command,
        get_current_user_command
    },
    discipline_command::{
        create_discipline_command, 
        delete_discipline_command,
        get_all_discipline_command,
        get_discipline_command,
        update_discipline_command
    },
    content_command::{
        create_content_command,
        update_content_command,
        get_all_content_command,
        get_content_command,
        delete_content_command
    },
    study_item_command::{
        create_study_item_command,
        get_all_study_item_command,
        get_study_item_command,
        delete_study_item_command
    }
};

mod command;
mod db;
mod error;
mod model;
mod repository;
mod service;
mod utils;
mod filesystem;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle().clone();
            
            let paths = init_directories(&app_handle).map_err(|e| e.to_string())?;
            app_handle.manage(paths);

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
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            create_user_command,
            authentication_user_command,
            update_user_command,
            get_current_user_command,
            create_discipline_command,
            delete_discipline_command,
            get_all_discipline_command,
            get_discipline_command,
            update_discipline_command,
            create_content_command,
            update_content_command,
            get_all_content_command,
            get_content_command,
            delete_content_command,
            create_study_item_command,
            get_all_study_item_command,
            get_study_item_command,
            delete_study_item_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
