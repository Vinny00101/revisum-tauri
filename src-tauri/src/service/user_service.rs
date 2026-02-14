use std::{fs, path::Path};

use crate::{
    db::{
        config::DbStore,
        db_methods::{db_begin_tx, db_commit_tx, db_rollback_tx},
    },
    error::app_error::AppError,
    filesystem::AppPaths,
    model::user::UpdateUser,
    repository::{user_repository::UserRepository, user_status_repository::UserStatusRepository},
    service::dto::{
        message_response::Message,
        user_response::{UpdateUserRes, UserResponse},
    },
};
use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use password_hash::SaltString;
use rand::rngs::OsRng;
use tauri::State;
use uuid::Uuid;

#[derive(serde::Serialize)]
pub struct Auth {
    pub code: bool,
    pub message: String,
    pub user: Option<UserResponse>,
}

pub struct UserService<'a> {
    user_repository: UserRepository<'a>,
    user_status_repository: UserStatusRepository<'a>,
}

impl<'a> UserService<'a> {
    pub fn new(
        user_repository: UserRepository<'a>,
        user_status_repository: UserStatusRepository<'a>,
    ) -> Self {
        Self {
            user_repository,
            user_status_repository,
        }
    }

    async fn save_avatar(
        &self,
        paths: &AppPaths,
        bytes: Vec<u8>,
        extension: String,
        old_avatar_path: Option<String>,
    ) -> Result<String, AppError> {
        if !paths.avatars.exists() {
            fs::create_dir_all(&paths.avatars)
                .map_err(|e| AppError::Internal(format!("Erro ao criar pasta: {}", e)))?;
        }

        let file_name = format!("{}.{}", Uuid::new_v4(), extension);
        let file_path = paths.avatars.join(&file_name);

        fs::write(&file_path, bytes)
            .map_err(|e| AppError::Internal(format!("Erro ao salvar imagem: {}", e)))?;

        if let Some(path_str) = old_avatar_path {
            let old_path = Path::new(&path_str);
            if old_path.exists() {
                let _ = fs::remove_file(old_path);
            }
        }

        Ok(file_path.to_string_lossy().into_owned())
    }

    fn verify_password(&self, password: &str, hash: &str) -> Result<bool, AppError> {
        let parsed_hash =
            PasswordHash::new(hash).map_err(|_| AppError::Internal("Hash inválid".into()))?;
        let argon2 = Argon2::default();
        Ok(argon2
            .verify_password(password.as_bytes(), &parsed_hash)
            .is_ok())
    }

    fn hash_password(&self, password: &str) -> Result<String, AppError> {
        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();

        let hash = argon2
            .hash_password(password.as_bytes(), &salt)
            .map_err(|_| AppError::Internal("Falha ao gerar hash".into()))?
            .to_string();

        Ok(hash)
    }

    pub async fn create_user(
        &self,
        state: State<'_, DbStore>,
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

        if self
            .user_repository
            .exists_email_username(username.clone(), email.clone())
            .await?
        {
            return Ok(Message {
                code: false,
                message: "Nome de usuário ou email jã existe".into(),
            });
        }

        let mut tx = db_begin_tx(&state).await?;

        let result: Result<i64, AppError> = async {
            let user_res = self
                .user_repository
                .create_user_tx(&mut tx, username, email, password_hash, None)
                .await?;
            let user_id = user_res.last_insert_id;

            self.user_status_repository
                .create_initial_status_tx(&mut tx, user_id)
                .await?;
            Ok(user_id)
        }
        .await;

        match result {
            Ok(_) => {
                db_commit_tx(tx).await?;
                Ok(Message {
                    code: true,
                    message: "Registro efetuado com sucesso".into(),
                })
            }
            Err(e) => {
                db_rollback_tx(tx).await?;
                Err(e)
            }
        }
    }

    pub async fn update_user(
        &self,
        state: State<'_, DbStore>,
        app_paths: &AppPaths,
        user_id: i64,
        update: UpdateUserRes,
    ) -> Result<Message, AppError> {
        let current_user = self
            .user_repository
            .get_user_by_id(user_id)
            .await?
            .ok_or_else(|| AppError::NotFound("Usuário não encontrado".into()))?;

        let mut needs_existence_check = false;
        let mut check_username = current_user.username.clone();
        let mut check_email = current_user.email.clone();
        let mut avatar_path_to_save: Option<String> = None;

        if let Some(new_username) = &update.username {
            if new_username != &current_user.username {
                check_username = new_username.clone();
                needs_existence_check = true;
            }
        }

        if let Some(new_email) = &update.email {
            if new_email != &current_user.email {
                check_email = new_email.clone();
                needs_existence_check = true;
            }
        }

        if needs_existence_check {
            if self
                .user_repository
                .exists_email_username(check_username, check_email)
                .await?
            {
                return Ok(Message {
                    code: false,
                    message: "Nome de usuário ou email já estão em uso".into(),
                });
            }
        }

        if let (Some(bytes), Some(ext)) =
            (update.avatar_bytes.clone(), update.avatar_extension.clone())
        {
            let path = self
                .save_avatar(app_paths, bytes, ext, current_user.avatar_path)
                .await?;
            avatar_path_to_save = Some(path);
        }

        let mut tx = db_begin_tx(&state).await?;

        let result: Result<(), AppError> = async {
            let repo_update = UpdateUser {
                username: update.username,
                email: update.email,
                password: update
                    .password
                    .map(|p| self.hash_password(&p))
                    .transpose()?,
                avatar_path: avatar_path_to_save,
            };

            self.user_repository
                .update_user_tx(&mut tx, user_id, repo_update)
                .await?;

            Ok(())
        }
        .await;

        match result {
            Ok(_) => {
                db_commit_tx(tx).await?;
                Ok(Message {
                    code: true,
                    message: "Perfil atualizado com sucesso".into(),
                })
            }
            Err(e) => {
                db_rollback_tx(tx).await?;
                Err(e)
            }
        }
    }

    pub async fn get_current_user(
        &self, 
        user_id: i64
    ) -> Result<Auth, AppError> {
        if !self.user_repository.exists_by_id(user_id).await? {
            return Ok(Auth {
                code: false,
                message: "user_id não foi encontrado".into(),
                user: None,
            });
        }

        let user = self.user_repository.get_user_by_id(user_id).await?
            .ok_or("Usuário não encontrado")?;
        let status = self.user_status_repository.get_by_user_id(user_id).await?;

        let result = UserResponse::new(&user, status);

        Ok(Auth {
            code: true,
            message: "Busca efetuada com sucesso".into(),
            user: Some(result),
        })
    }

    pub async fn authentication_user(
        &self,
        username: String,
        password: String,
    ) -> Result<Auth, AppError> {
        if username.is_empty() || password.is_empty() {
            return Ok(Auth {
                code: false,
                message: AppError::InvalidInput("Campos não preenchidos".to_string()).to_string(),
                user: None,
            });
        }

        let user = self.user_repository.get_user(username).await?;
        if user.is_none() {
            return Ok(Auth {
                code: false,
                message: "username ou password incorreto".into(),
                user: None,
            });
        }

        let user_result = user.unwrap();

        if !self.verify_password(&password, &user_result.password)? {
            return Ok(Auth {
                code: false,
                message: "username ou password incorreto".into(),
                user: None,
            });
        }
        let status = self.user_status_repository.get_by_user_id(user_result.id).await?;
        let result = UserResponse::new(&user_result, status);

        Ok(Auth {
            code: true,
            message: "Logado com sucesso".into(),
            user: Some(result),
        })
    }
}
