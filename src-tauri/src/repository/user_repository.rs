use std::vec;

use crate::model::user::User;
use crate::repository::base_repository::{EntityRepository, QueryRepository};
use crate::{db::db_methods::ExecuteResult, repository::base_repository::MutationRepository};
use crate::error::app_error::AppError;
use serde_json::Value as JsonValue;
use tauri::State;

use crate::db::config::DbStore;

pub(crate) struct UserRepository<'a> {
    state: State<'a, DbStore>,
}

impl<'a> UserRepository<'a> {
    pub fn new(state: State<'a, DbStore>) -> Self {
        Self { state }
    }

    pub async fn create_user(
        &self,
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

        self.execute(
            "INSERT INTO user (username, email, password, avatar_path, created_at, updated_at)VALUES (?, ?, ?, ?, ?, ?)",
            values,
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

