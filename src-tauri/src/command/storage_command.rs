use crate::db::{
    backup::BackupManifest,
    storage::{StorageManager, StorageStatus},
};
use tauri::{AppHandle, Manager, State};

#[tauri::command]
pub fn get_storage_status(state: State<'_, StorageManager>) -> StorageStatus {
    state.status()
}

#[tauri::command]
pub async fn list_storage_backups(app: AppHandle) -> Result<Vec<BackupManifest>, String> {
    tauri::async_runtime::spawn_blocking(move || app.state::<StorageManager>().list_backups())
        .await
        .map_err(|e| e.to_string())?
}

#[tauri::command]
pub async fn create_storage_backup(app: AppHandle) -> Result<BackupManifest, String> {
    // Maintenance includes filesystem scans and fsync. Keep this work on a
    // blocking worker; only its result crosses the async IPC boundary.
    tauri::async_runtime::spawn_blocking(move || {
        let state = app.state::<StorageManager>();
        tauri::async_runtime::block_on(state.create_backup())
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command(rename_all = "snake_case")]
pub async fn restore_storage_backup(app: AppHandle, backup_id: String) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let state = app.state::<StorageManager>();
        tauri::async_runtime::block_on(state.restore_backup(&backup_id))
    })
    .await
    .map_err(|e| e.to_string())?
}
