use tauri::State;

use crate::{db::{config::DbStore, db_methods::ExecuteResult}, error::app_error::AppError, model::discipline::{Discipline, UpdateDiscipline}, repository::base_repository::{EntityRepository, MutationRepository, QueryRepository}};
use serde_json::Value as JsonValue;

pub(crate) struct DisciplineRepository<'a>{
    state: State<'a, DbStore>,
} 

impl<'a> DisciplineRepository<'a> {
    pub fn new(state: State<'a, DbStore>) -> Self {
        Self { state }
    }
    // create_discipline
    pub async fn create_discipline(
        &self,
        user_id: i64,
        name: String,
        description: Option<String>,
    ) -> Result<ExecuteResult ,AppError>{
        let mut values = vec![
            JsonValue::from(user_id),
            JsonValue::String(name),
        ];

        values.push(match description {
            Some(desc) => JsonValue::String(desc),
            None => JsonValue::Null,
        });

        let now = chrono::Utc::now().to_rfc3339();
        values.push(JsonValue::String(now.clone()));
        values.push(JsonValue::String(now));

        self.execute(
            "INSERT INTO discipline (user_id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)", 
            values,
        ).await
    }
    // update_discipline
    pub async fn update_discipline(
        &self,
        user_id: i64,
        discipline_id: i64,
        update: UpdateDiscipline,
    ) -> Result<ExecuteResult, AppError>{
        let mut fields = Vec::new();
        let mut values = Vec::new();

        if let Some(name) = update.name {
            fields.push("name = ?");
            values.push(JsonValue::String(name));
        }

        if let Some(description) = update.description {
            fields.push("description = ?");
            values.push(JsonValue::String(description));
        }

        fields.push("updated_at = ?");
        values.push(JsonValue::String(chrono::Utc::now().to_rfc3339()));

        if fields.is_empty() {
            return Err(AppError::InvalidInput("Nada para atualizar".into()));
        }

        values.push(JsonValue::from(discipline_id));
        values.push(JsonValue::from(user_id));

        let query = format!(
            "UPDATE discipline SET {} WHERE id = ? AND user_id = ?",
            fields.join(","),
        );

        self.execute(
            &query, 
            values
        ).await
    }
    
    pub async fn delete_discipline(
        &self,
        user_id: i64,
        discipline_id: i64,
    ) -> Result<ExecuteResult, AppError> {
        self.execute(
            "DELETE FROM discipline WHERE id = ? AND user_id = ?",
            vec![JsonValue::from(discipline_id),JsonValue::from(user_id)],
        ).await
    }
    // get_discipline
    pub async fn get_discipline(
        &self,
        id: i64,
        user_id: i64,
    ) -> Result<Option<Discipline>, AppError>{
        self.find_one(
            "SELECT * FROM discipline WHERE id = ? AND user_id = ?", 
            vec![JsonValue::from(id), JsonValue::from(user_id)],
        ).await
    }
    // get_all_discipline
    pub async fn get_all_discipline(
        &self,
        user_id: i64,
    ) -> Result<Vec<Discipline>, AppError> {
        self.find_all(
            "SELECT * FROM discipline WHERE user_id = ? ORDER BY created_at DESC", 
            vec![JsonValue::from(user_id)],
        ).await
    }
    // exists_name_discipline
    pub async fn exists_name_discipline(
        &self,
        user_id: i64,
        name: String,
    ) -> Result<bool, AppError> {
        self.exists(
            "SELECT 1 FROM discipline WHERE user_id = ? AND name = ? LIMIT 1", 
            vec![JsonValue::from(user_id),JsonValue::String(name)],
        ).await
    }
    // exists_by_id
    pub async fn exists_by_id(
        &self,
        id: i64,
        user_id: i64,
    ) -> Result<bool, AppError>{
        self.exists(
            "SELECT 1 FROM discipline WHERE user_id = ? AND id = ? LIMIT 1", 
            vec![JsonValue::from(user_id), JsonValue::from(id)],
        ).await
    }
}

impl<'a> MutationRepository for DisciplineRepository<'a> {
    fn get_state(&self) ->  &State<'_,DbStore> {
        &self.state
    }
}

impl<'a> QueryRepository for  DisciplineRepository<'a> {
    fn get_state(&self) ->  &State<'_,DbStore> {
        &self.state
    }
}

impl<'a> EntityRepository<Discipline> for DisciplineRepository<'a> {
    fn get_state(&self) ->  &State<'_,DbStore> {
        &self.state
    }
}