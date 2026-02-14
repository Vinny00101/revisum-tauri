use serde_json::Value as JsonValue;
use sqlx::{Sqlite, Transaction};
use tauri::State;

use crate::{
    db::{config::DbStore, db_methods::ExecuteResult},
    error::app_error::AppError,
    model::studyitem::StudyItem,
    repository::base_repository::{EntityRepository, MutationRepository, QueryRepository},
};

pub(crate) struct StudyItemRepository<'a> {
    state: State<'a, DbStore>,
}

impl<'a> StudyItemRepository<'a> {
    pub fn new(state: State<'a, DbStore>) -> Self {
        Self { state }
    }

    pub async fn get_by_id(&self, id: i64) -> Result<Option<StudyItem>, AppError> {
        self.find_one(
            "SELECT * FROM studyitem WHERE id = ?",
            vec![JsonValue::from(id)],
        )
        .await
    }

    pub async fn get_by_content(&self, content_id: i64) -> Result<Vec<StudyItem>, AppError> {
        self.find_all(
            "SELECT * FROM studyitem WHERE content_id = ? ORDER BY created_at ASC",
            vec![JsonValue::from(content_id)],
        )
        .await
    }

    pub async fn delete_tx(
        &self, 
        tx: &mut Transaction<'_, Sqlite>,
        id: i64,
        content_id: i64
    ) -> Result<ExecuteResult, AppError> {
        self.execute_tx(
            tx,
            "DELETE FROM studyitem WHERE id = ? AND content_id ?",
            vec![JsonValue::from(id), JsonValue::from(content_id)],
        )
        .await
    }

    pub async fn create_study_item_tx(
        &self,
        tx: &mut Transaction<'_, Sqlite>,
        content_id: i64,
        item_type: String,
    ) -> Result<ExecuteResult, AppError> {
        let now = chrono::Utc::now().to_rfc3339();

        self.execute_tx(
            tx, 
            "INSERT INTO studyitem (content_id, item_type, created_at, updated_at)
             VALUES (?, ?, ?, ?)", 
            vec![
                JsonValue::from(content_id),
                JsonValue::String(item_type),
                JsonValue::String(now.clone()),
                JsonValue::String(now),
            ],
        ).await
    }
}

impl<'a> MutationRepository for StudyItemRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}

impl<'a> QueryRepository for StudyItemRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}

impl<'a> EntityRepository<StudyItem> for StudyItemRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}
