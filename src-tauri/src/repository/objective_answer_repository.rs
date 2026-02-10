use sqlx::{Sqlite, Transaction};
use tauri::State;
use serde_json::Value as JsonValue;

use crate::{
    db::{config::DbStore, db_methods::ExecuteResult},
    error::app_error::AppError,
    model::objective_answer::ObjectiveAnswer,
    repository::base_repository::{EntityRepository, MutationRepository, QueryRepository},
};

pub(crate) struct ObjectiveAnswerRepository<'a> {
    state: State<'a, DbStore>,
}

impl<'a> ObjectiveAnswerRepository<'a> {
    pub fn new(state: State<'a, DbStore>) -> Self {
        Self { state }
    }

    // create_objective_answer
    pub async fn create_objective_answer(
        &self,
        question_id: i64,
        text: String,
        image: Option<String>,
        is_correct: i64,
    ) -> Result<ExecuteResult, AppError> {
        let mut values = vec![
            JsonValue::from(question_id),
            JsonValue::String(text),
        ];

        values.push(match image {
            Some(img) => JsonValue::String(img),
            None => JsonValue::Null,
        });

        values.push(JsonValue::from(is_correct));

        self.execute(
            "INSERT INTO objective_answer (
                question_id,
                text,
                image,
                is_correct
            ) VALUES (?, ?, ?, ?)",
            values,
        )
        .await
    }

    // get_by_question
    pub async fn get_by_question(
        &self,
        question_id: i64,
    ) -> Result<Vec<ObjectiveAnswer>, AppError> {
        self.find_all(
            "SELECT * FROM objective_answer WHERE question_id = ?",
            vec![JsonValue::from(question_id)],
        )
        .await
    }

    // delete_by_question
    pub async fn delete_by_question(
        &self,
        question_id: i64,
    ) -> Result<ExecuteResult, AppError> {
        self.execute(
            "DELETE FROM objective_answer WHERE question_id = ?",
            vec![JsonValue::from(question_id)],
        )
        .await
    }

    pub async fn create_objective_answer_tx(
        &self,
        tx: &mut Transaction<'_, Sqlite>,
        question_id: i64,
        text: String,
        image: Option<String>,
        is_correct: i64,
    ) -> Result<ExecuteResult, AppError> {
        let mut values = vec![
            JsonValue::from(question_id),
            JsonValue::String(text),
        ];

        values.push(match image {
            Some(img) => JsonValue::String(img),
            None => JsonValue::Null,
        });

        values.push(JsonValue::from(is_correct));

        self.execute_tx(
            tx,
            "INSERT INTO objective_answer (
                question_id,
                text,
                image,
                is_correct
            ) VALUES (?, ?, ?, ?)",
            values,
        )
        .await
    }

}

impl<'a> MutationRepository for ObjectiveAnswerRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}

impl<'a> QueryRepository for ObjectiveAnswerRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}

impl<'a> EntityRepository<ObjectiveAnswer> for ObjectiveAnswerRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}
