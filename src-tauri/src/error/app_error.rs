use thiserror::Error;


#[derive(Error, Debug)]
pub enum AppError {
    #[error("Erro no banco de dados: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Erro no banco de dados: {0}")]
    DatabaseMethods(String),

    #[error("Falha na migração: {0}")]
    Migration(String),

    #[error("Conexão falhou: {0}")]
    ConnectionFailed(String),

    /*
    #[error("Registro não encontrado")]
    NotFound,
     */

    #[error("Entrada inválida: {0}")]
    InvalidInput(String),

    #[error("Erro interno: {0}")]
    Internal(String),
}

impl AppError {
    pub fn to_frontend(&self) -> String {
        self.to_string()
    }
}

impl From<String> for AppError {
    fn from(s: String) -> Self {
        AppError::Internal(s)
    }
}

impl From<&str> for AppError {
    fn from(s: &str) -> Self {
        AppError::Internal(s.to_string())
    }
}