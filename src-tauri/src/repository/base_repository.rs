

use sqlx::{FromRow, sqlite::SqliteRow};
use tauri::State;
use serde_json::Value as JsonValue;

use crate::{db::{config::DbStore, db_methods::{ExecuteResult, db_execute, db_exists, db_select_many, db_select_one}}, error::app_error::AppError};


#[async_trait::async_trait]
pub trait EntityRepository<T>
where
    T: for<'r> FromRow<'r, SqliteRow> + Unpin + Send + Sync + 'static,
{
    fn get_state(&self) -> &State<'_, DbStore>;

    async fn find_all(
        &self,
        sql: &str,
        values: Vec<JsonValue>,
    ) -> Result<Vec<T>, AppError>{
        db_select_many::<T>(self.get_state(), sql, values).await
    }

    async fn find_one(
        &self,
        sql: &str,
        values: Vec<JsonValue>,
    ) -> Result<Option<T>, AppError>{
        db_select_one::<T>(self.get_state(), sql, values).await
    }
}

#[async_trait::async_trait]
pub trait QueryRepository {
    fn get_state(&self) -> &State<'_, DbStore>;

    async fn exists(
        &self,
        sql: &str,
        values: Vec<JsonValue>,
    ) -> Result<bool, AppError> {
        db_exists(self.get_state(), sql, values).await
    }
}


#[async_trait::async_trait]
pub trait MutationRepository {
    fn get_state(&self) -> &State<'_, DbStore>;

    async fn execute(
        &self,
        sql: &str,
        values: Vec<JsonValue>,
    ) -> Result<ExecuteResult, AppError>{
        db_execute(self.get_state(), sql, values).await
    }
}