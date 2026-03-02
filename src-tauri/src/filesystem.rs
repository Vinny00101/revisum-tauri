use std::{fs::create_dir_all, path::PathBuf};

use tauri::{AppHandle, Manager};

use crate::error::app_error::AppError;

pub struct AppPaths {
    //pub root: PathBuf,
    pub avatars: PathBuf,
    pub questions: PathBuf,
}

impl AppPaths {
    pub fn new(app: &AppHandle) -> Result<Self, AppError> {
        let app_dir = app.path().app_data_dir()
            .map_err(|e| AppError::Internal(format!("Falha ao obter AppData: {}", e)))?;

        Ok(Self {
            //root: app_dir.clone(), 
            avatars: app_dir.join("images").join("user").join("avatar"), 
            questions: app_dir.join("images").join("question"),
        })
    }
}

pub fn init_directories(app: &AppHandle) -> Result<AppPaths, AppError> {
    let paths = AppPaths::new(app)?;

    // Criar a árvore de diretórios
    create_dir_all(&paths.avatars)
        .map_err(|e| AppError::Internal(format!("Erro ao criar pasta de avatars: {}", e)))?;
    
    create_dir_all(&paths.questions)
        .map_err(|e| AppError::Internal(format!("Erro ao criar pasta de questões: {}", e)))?;

    Ok(paths)
}