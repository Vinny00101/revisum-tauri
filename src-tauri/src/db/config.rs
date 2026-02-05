use std::{fs::create_dir_all};

use sqlx::{Sqlite, SqlitePool, migrate::MigrateDatabase};
use tauri::{AppHandle, Manager};

use crate::error::app_error::AppError;


#[derive(Clone)]
pub struct DbStore{
    pub pool: SqlitePool,
}


pub async fn init_db(app: &AppHandle) -> Result<DbStore, AppError> {
    let app_dir: std::path::PathBuf = app.path().app_data_dir().map_err(|e| AppError::Internal(format!("Falha ao obter AppData: {}", e)))?;
    create_dir_all(&app_dir).map_err(|e| AppError::Internal(format!("Error ao criar o diretório: {}", e)))?;

    let db_path: std::path::PathBuf = app_dir.join("teste.db");
    let db_url: String = format!("sqlite:{}", db_path.to_str().ok_or(AppError::Internal("Path inválido".to_string()))?);

    if !Sqlite::database_exists(&db_url).await.unwrap_or(false) {
        Sqlite::create_database(&db_url).await.map_err(AppError::Database)?;
    }

    let pool: sqlx::Pool<Sqlite> = SqlitePool::connect(&db_url).await.map_err(|e| AppError::ConnectionFailed(e.to_string()))?;

    // Use the sqlx::migrate! macro to automatically generate the migrator
    sqlx::migrate!("./migrations").run(&pool).await.map_err(|e| AppError::Migration(format!("Falha na migração: {}", e)))?;

    Ok(DbStore { pool })
}