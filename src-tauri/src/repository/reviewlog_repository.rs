
use crate::error::app_error::AppError;
use crate::model::reviewlog::Reviewlog;
use crate::repository::base_repository::{EntityRepository, QueryRepository, MutationRepository};
use crate::db::config::DbStore;
use serde_json::Value as JsonValue;
use tauri::State;

pub(crate) struct ReviewLogRepository<'a> {
    state: State<'a, DbStore>,
}

impl<'a> ReviewLogRepository<'a> {
    pub fn new(state: State<'a, DbStore>) -> Self {
        Self { state }
    }

    pub async fn get_reviewlog_by_user(
        &self,
        user_id: i64,
    ) -> Result<Vec<Reviewlog>, AppError> {
        self.find_all(
            "SELECT * FROM reviewlog WHERE user_id = ? ORDER BY review_time DESC LIMIT 10",
            vec![JsonValue::from(user_id)],
        ).await
    }
}

// Implementações dos Traits do Base Repository

impl<'a> MutationRepository for ReviewLogRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}

impl<'a> QueryRepository for ReviewLogRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}

impl<'a> EntityRepository<Reviewlog> for ReviewLogRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}