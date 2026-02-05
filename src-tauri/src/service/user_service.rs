use crate::{
    error::app_error::AppError, repository::user_repository::UserRepository,
};
use sha2::{Digest, Sha256};
use base64::{engine::general_purpose, Engine as _};

#[derive(serde::Serialize)]
pub struct Message {
    pub code: bool,
    pub message: String,
}

pub struct UserService<'a> {
    user_repository: UserRepository<'a>,
}

impl<'a> UserService<'a> {
    pub fn new(user_repository: UserRepository<'a>) -> Self {
        Self { user_repository }
    }
    
    fn hash_password(&self, password: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(password.as_bytes());
        let result = hasher.finalize();
        general_purpose::STANDARD.encode(result)
    }

    pub async fn create_user(
        &self,
        username: String,
        password: String,
        email: String,
    ) -> Result<Message, AppError> {
        if username.is_empty() || password.is_empty() || email.is_empty() {
            return Ok(Message {
                code: false,
                message: "Campos não preenchidos".into(),
            });
        }

        let password_hash = self.hash_password(&password);

        self.user_repository
            .create_user(username, email, password_hash, None)
            .await?;

        Ok(Message {
            code: true,
            message: "Registro efetuado com sucesso".into(),
        })
    }
}
