use sqlx::{Sqlite, Transaction};
use tauri::State;
use serde_json::Value as JsonValue;

use crate::{
    db::{config::DbStore, db_methods::ExecuteResult},
    error::app_error::AppError,
    model::discursive_response::DiscursiveResponse,
    repository::base_repository::{EntityRepository, MutationRepository, QueryRepository},
};

pub(crate) struct DiscursiveResponseRepository<'a> {
    state: State<'a, DbStore>,
}

impl<'a> DiscursiveResponseRepository<'a> {
    pub fn new(state: State<'a, DbStore>) -> Self {
        Self { state }
    }

    // get_by_question
    pub async fn get_by_question(
        &self,
        question_id: i64,
    ) -> Result<Option<DiscursiveResponse>, AppError> {
        self.find_one(
            "SELECT * FROM discursive_response WHERE question_id = ?",
            vec![JsonValue::from(question_id)],
        )
        .await
    }
    #[allow(dead_code)]

    // delete_by_question
    pub async fn delete_by_question(
        &self,
        question_id: i64,
    ) -> Result<ExecuteResult, AppError> {
        self.execute(
            "DELETE FROM discursive_response WHERE question_id = ?",
            vec![JsonValue::from(question_id)],
        )
        .await
    }

    pub async fn create_discursive_response_tx(
        &self,
        tx: &mut Transaction<'_, Sqlite>,
        question_id: i64,
        expected_answer: String,
        evaluation_criteria: Option<String>,
    ) -> Result<ExecuteResult, AppError> {
        let mut values = vec![
            JsonValue::from(question_id),
            JsonValue::String(expected_answer),
        ];

        values.push(match evaluation_criteria {
            Some(criteria) => JsonValue::String(criteria),
            None => JsonValue::Null,
        });

        self.execute_tx(
            tx,
            "INSERT INTO discursive_response (
                question_id,
                expected_answer,
                evaluation_criteria
            ) VALUES (?, ?, ?)",
            values,
        )
        .await
    }

}

impl<'a> MutationRepository for DiscursiveResponseRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}

impl<'a> QueryRepository for DiscursiveResponseRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}

impl<'a> EntityRepository<DiscursiveResponse> for DiscursiveResponseRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}
