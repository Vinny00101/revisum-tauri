use tauri::State;

use crate::{db::{config::DbStore, db_methods::ExecuteResult}, error::app_error::AppError, model::content::{Content, UpdateContent}, repository::base_repository::{EntityRepository, MutationRepository, QueryRepository}};
use serde_json::Value as JsonValue;

pub(crate) struct ContentRepository<'a>{
    state: State<'a, DbStore>,
} 

impl<'a> ContentRepository<'a> {
    pub fn new(state: State<'a, DbStore>) -> Self {
        Self { state }
    }

    pub async fn create_content(
        &self,
        discipline_id: i64,
        title: String,
        description: Option<String>,
        display_order: i64
    ) -> Result<ExecuteResult,AppError>{
        let mut values = vec![
            JsonValue::from(discipline_id),
            JsonValue::String(title),
        ];
        values.push(match description {
            Some(desc) => JsonValue::String(desc),
            None => JsonValue::Null,
        });
        values.push(JsonValue::from(display_order));

        let now = chrono::Utc::now().to_rfc3339();
        values.push(JsonValue::String(now.clone()));
        values.push(JsonValue::String(now));

        self.execute(
            "INSERT INTO content (discipline_id, title, description, display_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)", 
            values,
        ).await
    }

    pub async fn update_content(
        &self,
        content_id: i64,
        update: UpdateContent,
    ) -> Result<ExecuteResult, AppError>{
        let mut fields = Vec::new();
        let mut values = Vec::new();

        if let Some(title) = update.title {
            fields.push("name = ?");
            values.push(JsonValue::String(title));
        }

        if let Some(description) = update.description {
            fields.push("description = ?");
            values.push(JsonValue::String(description));
        }

        if let Some(display_order) = update.display_order {
            fields.push("display_order = ?");
            values.push(JsonValue::from(display_order));
        }

        fields.push("updated_at = ?");
        values.push(JsonValue::String(chrono::Utc::now().to_rfc3339()));

        if fields.is_empty() {
            return Err(AppError::InvalidInput("Nada para atualizar".into()));
        }

        values.push(JsonValue::from(content_id));

        let query = format!(
            "UPDATE content SET {} WHERE id = ?",
            fields.join(","),
        );

        self.execute(
            &query, 
            values
        ).await
    }

    pub async fn delete_content(
        &self,
        discipline_id: i64,
        content_id: i64
    ) -> Result<ExecuteResult, AppError> {
        self.execute(
            "DELETE FROM content WHERE id = ? AND discipline_id = ?",
            vec![JsonValue::from(content_id),JsonValue::from(discipline_id)],
        ).await
    }

    pub async fn get_content(
        &self,
        id: i64,
        discipline_id: i64,
    ) -> Result<Option<Content>, AppError>{
        self.find_one(
            "SELECT * FROM content WHERE id = ? AND discipline_id = ?", 
            vec![JsonValue::from(id), JsonValue::from(discipline_id)],
        ).await
    }

    pub async fn get_content_by_id(
        &self,
        id: i64,
    ) -> Result<Option<Content>, AppError>{
        self.find_one(
            "SELECT * FROM content WHERE id = ?", 
            vec![JsonValue::from(id)],
        ).await
    }

    pub async fn get_all_content(
        &self,
        discipline_id: i64,
    ) -> Result<Vec<Content>, AppError> {
        self.find_all(
            "SELECT * FROM content WHERE discipline_id = ? ORDER BY display_order ASC", 
            vec![JsonValue::from(discipline_id)],
        ).await
    }

    pub async fn get_all_content_user(
        &self,
        user_id: i64,
    ) -> Result<Vec<Content>, AppError> {
        self.find_all(
            "SELECT c.* FROM content c JOIN discipline d ON c.discipline_id = d.id WHERE d.user_id = ? ORDER BY c.display_order ASC",
            vec![JsonValue::from(user_id)],
        ).await
    }
    pub async fn exists_by_title(
        &self,
        discipline_id: i64,
        title: String,
    ) -> Result<bool, AppError> {
        self.exists(
            "SELECT 1 FROM content WHERE discipline_id = ? AND title = ? LIMIT 1", 
            vec![JsonValue::from(discipline_id),JsonValue::String(title)],
        ).await
    }

    pub async fn exists_by_id(
        &self,
        discipline_id: i64,
        content_id: i64,
    ) -> Result<bool, AppError>{
        self.exists(
            "SELECT 1 FROM content WHERE discipline_id = ? AND id = ? LIMIT 1", 
            vec![JsonValue::from(discipline_id),JsonValue::from(content_id)],
        ).await
    }

    pub async fn exists_by_id_user(
        &self,
        content_id: i64,
        user_id: i64,
    ) -> Result<bool, AppError>{
        self.exists(
            "SELECT EXISTS ( SELECT 1 FROM content c JOIN discipline d ON d.id = c.discipline_id WHERE c.id = ? AND d.user_id = ?);", 
            vec![JsonValue::from(content_id),JsonValue::from(user_id)],
        ).await
    }
}

impl<'a> MutationRepository for ContentRepository<'a> {
    fn get_state(&self) ->  &State<'_,DbStore> {
        &self.state
    }
}

impl<'a> QueryRepository for  ContentRepository<'a> {
    fn get_state(&self) ->  &State<'_,DbStore> {
        &self.state
    }
}

impl<'a> EntityRepository<Content> for ContentRepository<'a> {
    fn get_state(&self) ->  &State<'_,DbStore> {
        &self.state
    }
}