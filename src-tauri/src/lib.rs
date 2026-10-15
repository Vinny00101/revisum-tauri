use tauri::{async_runtime::block_on, Manager};

use crate::{db::storage::StorageManager, filesystem::init_directories};
use command::storage_command::{get_storage_status, list_storage_backups, create_storage_backup, restore_storage_backup};
use command::{
    user_command::{
        authentication_user_command, 
        create_user_command,
        update_user_command,
        get_current_user_command,
        get_review_log_command
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
        get_all_content_user_command,
        get_content_command,
        delete_content_command
    },
    study_item_command::{
        create_study_item_command,
        get_all_study_item_command,
        get_study_item_command,
        delete_study_item_command,
        get_review_data_commmand
    },
    review_command::{
        create_session_review_command,
        update_session_review_command,
        get_all_session_review_command,
        get_one_session_review_command,
        save_item_review_command,
        cancel_session_review_command,
        save_item_review_question_obj_command,
        get_acurracy_geral_session_command
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
            
            let root = app_handle.path().app_data_dir()?;
            let (storage, database) = block_on(StorageManager::initialize(root));
            if let Some(database) = database {
                let paths = init_directories(&app_handle).map_err(|e| e.to_string())?;
                app_handle.manage(paths);
                app_handle.manage(database);
            }
            // Recovery commands remain available even when DbStore is not
            // registered. Study commands cannot obtain a pool in that state.
            app_handle.manage(storage);
            Ok(())
        })
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init()) 
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_storage_status,
            list_storage_backups,
            create_storage_backup,
            restore_storage_backup,
            // user
            create_user_command,
            authentication_user_command,
            update_user_command,
            get_current_user_command,
            get_review_log_command,
            // discipline
            create_discipline_command,
            delete_discipline_command,
            get_all_discipline_command,
            get_discipline_command,
            update_discipline_command,
            // content
            create_content_command,
            update_content_command,
            get_all_content_command,
            get_all_content_user_command,
            get_content_command,
            delete_content_command,
            // study_item
            create_study_item_command,
            get_all_study_item_command,
            get_study_item_command,
            delete_study_item_command,
            get_review_data_commmand,
            // review
            create_session_review_command,
            update_session_review_command,
            get_all_session_review_command,
            get_one_session_review_command,
            save_item_review_command,
            cancel_session_review_command,
            save_item_review_question_obj_command,
            get_acurracy_geral_session_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
