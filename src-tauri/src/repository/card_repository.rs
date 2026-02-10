use sqlx::{Sqlite, Transaction};
use tauri::State;
use serde_json::Value as JsonValue;

use crate::{
    db::{config::DbStore, db_methods::ExecuteResult},
    error::app_error::AppError,
    model::card::{Card, UpdateCard},
    repository::base_repository::{EntityRepository, MutationRepository, QueryRepository},
};

pub(crate) struct CardRepository<'a> {
    state: State<'a, DbStore>,
}

impl<'a> CardRepository<'a> {
    pub fn new(state: State<'a, DbStore>) -> Self {
        Self { state }
    }

    pub async fn create_card(
        &self,
        study_item_id: i64,
        front: String,
        back: String,
    ) -> Result<ExecuteResult, AppError> {
        let now = chrono::Utc::now().to_rfc3339();

        self.execute(
            "INSERT INTO card (study_item_id, front, back, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?)",
            vec![
                JsonValue::from(study_item_id),
                JsonValue::String(front),
                JsonValue::String(back),
                JsonValue::String(now.clone()),
                JsonValue::String(now),
            ],
        )
        .await
    }

    pub async fn update_card(
        &self,
        card_id: i64,
        update: UpdateCard,
    ) -> Result<ExecuteResult, AppError> {
        let mut fields = Vec::new();
        let mut values = Vec::new();

        if let Some(front) = update.front {
            fields.push("front = ?");
            values.push(JsonValue::String(front));
        }

        if let Some(back) = update.back {
            fields.push("back = ?");
            values.push(JsonValue::String(back));
        }

        fields.push("updated_at = ?");
        values.push(JsonValue::String(chrono::Utc::now().to_rfc3339()));

        values.push(JsonValue::from(card_id));

        let query = format!(
            "UPDATE card SET {} WHERE id = ?",
            fields.join(",")
        );

        self.execute(&query, values).await
    }

    pub async fn create_card_tx(
        &self,
        tx: &mut Transaction<'_, Sqlite>,
        study_item_id: i64,
        front: String,
        back: String,
    ) -> Result<ExecuteResult, AppError> {
        let now = chrono::Utc::now().to_rfc3339();

        self.execute_tx(
            tx,
            "INSERT INTO card (study_item_id, front, back, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?)",
            vec![
                JsonValue::from(study_item_id),
                JsonValue::String(front),
                JsonValue::String(back),
                JsonValue::String(now.clone()),
                JsonValue::String(now),
            ],
        )
        .await
    }

    pub async fn get_by_study_item(
        &self,
        study_item_id: i64,
    ) -> Result<Option<Card>, AppError>{
        self.find_one(
        "SELECT id, study_item_id, front, back, created_at, updated_at FROM card WHERE study_item_id = ? LIMIT 1",
        vec![JsonValue::from(study_item_id)]
        ).await
    }
}

impl<'a> MutationRepository for CardRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}

impl<'a> QueryRepository for CardRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}

impl<'a> EntityRepository<Card> for CardRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}
