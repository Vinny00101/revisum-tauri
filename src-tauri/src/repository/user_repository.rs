use std::vec;
use crate::model::user::UpdateUser;
use crate::model::{user::User};
use crate::repository::base_repository::{EntityRepository, QueryRepository};
use crate::{db::db_methods::ExecuteResult, repository::base_repository::MutationRepository};
use crate::error::app_error::AppError;
use serde_json::Value as JsonValue;
use sqlx::{Sqlite, Transaction};
use tauri::State;

use crate::db::config::DbStore;

pub(crate) struct UserRepository<'a> {
    state: State<'a, DbStore>,
}

impl<'a> UserRepository<'a> {
    pub fn new(state: State<'a, DbStore>) -> Self {
        Self { state }
    }

    pub async fn create_user_tx(
        &self,
        tx: &mut Transaction<'_, Sqlite>,
        username: String,
        email: String,
        password_hash: String,
        avatar_path: Option<String>,
    ) -> Result<ExecuteResult, AppError> {
        let mut values = vec![
            JsonValue::String(username),
            JsonValue::String(email),
            JsonValue::String(password_hash),
        ];

        values.push(match avatar_path {
            Some(path) => JsonValue::String(path),
            None => JsonValue::Null,
        });

        let now = chrono::Utc::now().to_rfc3339();
        values.push(JsonValue::String(now.clone()));
        values.push(JsonValue::String(now));

        self.execute_tx(
            tx,
            "INSERT INTO user (username, email, password, avatar_path, created_at, updated_at)VALUES (?, ?, ?, ?, ?, ?)",
            values,
        ).await
    }

    pub async fn update_user_tx(
        &self,
        tx: &mut Transaction<'_, Sqlite>,
        user_id: i64,
        update: UpdateUser,
    ) -> Result<ExecuteResult, AppError> {
        let mut fields = Vec::new();
        let mut values = Vec::new();

        if let Some(username) = update.username {
            fields.push("username = ?");
            values.push(JsonValue::String(username));
        }

        if let Some(email) = update.email {
            fields.push("email = ?");
            values.push(JsonValue::String(email));
        }

        if let Some(avatar) = update.avatar_path {
            fields.push("avatar_path = ?");
            values.push(JsonValue::String(avatar));
        }

        if let Some(password) = update.password {
            fields.push("password = ?");
            values.push(JsonValue::String(password));
        }

        fields.push("updated_at = ?");
        values.push(JsonValue::String(chrono::Utc::now().to_rfc3339()));

        if fields.len() <= 1 {
            return Err(AppError::InvalidInput("Nenhum dado fornecido para atualização".into()));
        }

        values.push(JsonValue::from(user_id));

        let query = format!(
            "UPDATE user SET {} WHERE id = ?",
            fields.join(", "),
        );

        self.execute_tx(
            tx,
            &query,
            values
        ).await
    }

    pub async fn get_user(
        &self,
        username: String,
    ) -> Result<Option<User>, AppError>{
        self.find_one(
            "SELECT * FROM user WHERE username = ?", 
            vec![JsonValue::String(username)]
        ).await
    }

    pub async fn get_user_by_id(
        &self,
        user_id: i64,
    ) -> Result<Option<User>, AppError>{
        self.find_one(
            "SELECT * FROM user WHERE id = ?",
            vec![JsonValue::from(user_id)]
        ).await
    }

    pub async fn exists_email_username(
        &self,
        username: String,
        email: String,
    ) -> Result<bool, AppError> {
        let values = vec![
            JsonValue::String(username),
            JsonValue::String(email),
        ];

        self.exists(
            "SELECT 1 FROM user WHERE username = ? OR email = ? LIMIT 1",
            values,
        ).await
    }

    pub async fn exists_by_id(
        &self,
        user_id: i64,
    ) -> Result<bool, AppError> {
        self.exists(
            "SELECT * FROM user WHERE id = ? LIMIT 1", 
            vec![JsonValue::from(user_id)]
        ).await
    }
}


impl<'a> MutationRepository for UserRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}

impl<'a> QueryRepository for UserRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}

impl<'a> EntityRepository<User> for UserRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}

