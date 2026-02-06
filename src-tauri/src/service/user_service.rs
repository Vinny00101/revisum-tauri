use crate::{
    error::app_error::AppError, repository::user_repository::UserRepository, service::dto::{message_response::Message, user_response::UserResponse}
};
use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use password_hash::{SaltString};
use rand::rngs::OsRng;

#[derive(serde::Serialize)]
pub struct Auth {
    pub code: bool,
    pub message: String,
    pub user: Option<UserResponse>,
}

pub struct UserService<'a> {
    user_repository: UserRepository<'a>,
}

impl<'a> UserService<'a> {
    pub fn new(user_repository: UserRepository<'a>) -> Self {
        Self { user_repository }
    }

    fn verify_password(
        &self,
        password: &str,
        hash: &str,
    ) -> Result<bool, AppError> {
        let parsed_hash = PasswordHash::new(hash).
            map_err(|_| AppError::Internal("Hash inválid".into()))?;
        let argon2  = Argon2::default();
        Ok(argon2
            .verify_password(password.as_bytes(), &parsed_hash)
            .is_ok()
        )
    }
    
    fn hash_password(&self, password: &str) -> Result<String, AppError> {
        let salt = SaltString::generate(&mut OsRng);
        let argon2  = Argon2::default();
        
        let hash = argon2
            .hash_password(password.as_bytes(), &salt)
            .map_err(|_| AppError::Internal("Falha ao gerar hash".into()))?
            .to_string();

        Ok(hash)
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
                message: AppError::InvalidInput("Campos não preenchidos".to_string()).to_string(),
            });
        }

        let password_hash = self.hash_password(&password)?;

        if self.user_repository.exists_email_username(username.clone(), email.clone()).await? {
            return Ok(Message { 
                code: false, 
                message: "Nome de usuário ou email jã existe".into() 
            });
        }

        self.user_repository
            .create_user(username, email, password_hash, None)
            .await?;

        Ok(Message {
            code: true,
            message: "Registro efetuado com sucesso".into(),
        })
    }

    pub async fn authentication_user(
        &self,
        username: String,
        password: String,
    ) -> Result<Auth, AppError> {
        if username.is_empty() || password.is_empty(){
            return Ok(Auth {
                code: false,
                message: AppError::InvalidInput("Campos não preenchidos".to_string()).to_string(),
                user: None,
            });
        }

        let user= self.user_repository.get_user(username).await?;
        if user.is_none() {
            return Ok(Auth { 
                code: false, 
                message: "username ou password incorreto".into(), 
                user: None 
            });
        }

        let user_result = user.unwrap();

        if !self.verify_password(&password, &user_result.password)?{
            return Ok(Auth {
                code: false,
                message: "username ou password incorreto".into(),
                user: None,
            });
        }

        let result = UserResponse::from(&user_result);


        Ok(Auth { 
            code: true, 
            message: "Logado com sucesso".into(), 
            user: Some(result),
        })
    }
}