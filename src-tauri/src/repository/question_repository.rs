use sqlx::{Sqlite, Transaction};
use tauri::State;
use serde_json::Value as JsonValue;

use crate::{
    db::{config::DbStore, db_methods::ExecuteResult},
    error::app_error::AppError,
    model::question::{Question, UpdateQuestion},
    repository::base_repository::{EntityRepository, MutationRepository, QueryRepository},
};

pub(crate) struct QuestionRepository<'a> {
    state: State<'a, DbStore>,
}

impl<'a> QuestionRepository<'a> {
    pub fn new(state: State<'a, DbStore>) -> Self {
        Self { state }
    }
    #[allow(dead_code)]

    // update_question
    pub async fn update_question(
        &self,
        question_id: i64,
        update: UpdateQuestion,
    ) -> Result<ExecuteResult, AppError> {
        let mut fields = Vec::new();
        let mut values = Vec::new();

        if let Some(text) = update.statement_text {
            fields.push("statement_text = ?");
            values.push(JsonValue::String(text));
        }

        if let Some(image) = update.statement_image {
            fields.push("statement_image = ?");
            values.push(JsonValue::String(image));
        }

        fields.push("updated_at = ?");
        values.push(JsonValue::String(chrono::Utc::now().to_rfc3339()));

        if fields.is_empty() {
            return Err(AppError::InvalidInput("Nada para atualizar".into()));
        }

        values.push(JsonValue::from(question_id));

        let query = format!(
            "UPDATE question SET {} WHERE id = ?",
            fields.join(","),
        );

        self.execute(&query, values).await
    }

    #[allow(dead_code)]

    pub async fn get_by_id(
        &self,
        id: i64,
    ) -> Result<Option<Question>, AppError> {
        self.find_one(
            "SELECT * FROM question WHERE id = ?",
            vec![JsonValue::from(id)],
        )
        .await
    }

    // get_by_study_item
    pub async fn get_by_study_item(
        &self,
        study_item_id: i64,
    ) -> Result<Option<Question>, AppError> {
        self.find_one(
            "SELECT * FROM question WHERE study_item_id = ? LIMIT 1",
            vec![JsonValue::from(study_item_id)],
        )
        .await
    }

    #[allow(dead_code)]

    // delete_question
    pub async fn delete_question(
        &self,
        id: i64,
    ) -> Result<ExecuteResult, AppError> {
        self.execute(
            "DELETE FROM question WHERE id = ?",
            vec![JsonValue::from(id)],
        )
        .await
    }

    pub async fn create_question_tx(
        &self,
        tx: &mut Transaction<'_, Sqlite>,
        study_item_id: i64,
        question_type: String,
        statement_text: String,
        statement_image: Option<String>,
    ) -> Result<ExecuteResult, AppError> {
        let mut values = vec![
            JsonValue::from(study_item_id),
            JsonValue::String(question_type),
            JsonValue::String(statement_text),
        ];

        values.push(match statement_image {
            Some(img) => JsonValue::String(img),
            None => JsonValue::Null,
        });

        let now = chrono::Utc::now().to_rfc3339();
        values.push(JsonValue::String(now.clone()));
        values.push(JsonValue::String(now));

        self.execute_tx(
            tx,
            "INSERT INTO question (
                study_item_id,
                question_type,
                statement_text,
                statement_image,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?)",
            values,
        )
        .await
    }

}

impl<'a> MutationRepository for QuestionRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}

impl<'a> QueryRepository for QuestionRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}

impl<'a> EntityRepository<Question> for QuestionRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}
