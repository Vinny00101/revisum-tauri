use serde::{Deserialize, Serialize};
use sqlx::{Sqlite, Transaction, prelude::FromRow};
use tauri::State;

use crate::{
    db::{config::DbStore, db_methods::ExecuteResult},
    error::app_error::AppError,
    model::discipline::{Discipline, UpdateDiscipline},
    repository::base_repository::{EntityRepository, MutationRepository, QueryRepository},
};
use serde_json::Value as JsonValue;

pub(crate) struct DisciplineRepository<'a> {
    state: State<'a, DbStore>,
}

#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct DisciplineIdLookup {
    pub discipline_id: i64,
}

#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct ReviewLogLookup {
    pub evaluation: String,
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
    ) -> Result<ExecuteResult, AppError> {
        let mut values = vec![JsonValue::from(user_id), JsonValue::String(name)];

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
    ) -> Result<ExecuteResult, AppError> {
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

        self.execute(&query, values).await
    }

    pub async fn delete_discipline(
        &self,
        user_id: i64,
        discipline_id: i64,
    ) -> Result<ExecuteResult, AppError> {
        self.execute(
            "DELETE FROM discipline WHERE id = ? AND user_id = ?",
            vec![JsonValue::from(discipline_id), JsonValue::from(user_id)],
        )
        .await
    }
    // get_discipline
    pub async fn get_discipline(
        &self,
        id: i64,
        user_id: i64,
    ) -> Result<Option<Discipline>, AppError> {
        let sql = r#"
            SELECT d.id, d.user_id, d.name, d.description, d.created_at, d.updated_at, p.total_items, p.items_mastered, p.progress_percent, p.last_review_date
            FROM discipline d
            INNER JOIN discipline_progress p ON d.id = p.discipline_id
            WHERE d.id = ? AND d.user_id = ?
        "#;
        self.find_one(sql, vec![JsonValue::from(id), JsonValue::from(user_id)])
            .await
    }
    // get_all_discipline
    pub async fn get_all_discipline(&self, user_id: i64) -> Result<Vec<Discipline>, AppError> {
        let sql = r#" 
            SELECT d.id, d.user_id, d.name, d.description, d.created_at, d.updated_at, p.total_items, p.items_mastered, p.progress_percent, p.last_review_date
            FROM discipline d
            INNER JOIN discipline_progress p ON d.id = p.discipline_id
            WHERE d.user_id = ?
            ORDER BY d.created_at DESC
        "#;
        self.find_all(sql, vec![JsonValue::from(user_id)]).await
    }
    // exists_name_discipline
    pub async fn exists_name_discipline(
        &self,
        user_id: i64,
        name: String,
    ) -> Result<bool, AppError> {
        self.exists(
            "SELECT 1 FROM discipline WHERE user_id = ? AND name = ? LIMIT 1",
            vec![JsonValue::from(user_id), JsonValue::String(name)],
        )
        .await
    }
    // exists_by_id
    pub async fn exists_by_id(&self, id: i64, user_id: i64) -> Result<bool, AppError> {
        self.exists(
            "SELECT 1 FROM discipline WHERE user_id = ? AND id = ? LIMIT 1",
            vec![JsonValue::from(user_id), JsonValue::from(id)],
        )
        .await
    }

    pub async fn discipline_progress_update_tx(
        &self,
        tx: &mut Transaction<'_, Sqlite>,
        user_id: i64,
        study_item_id: i64,
        evaluation: String,
    ) -> Result<(), AppError> {
        let now = chrono::Utc::now().to_rfc3339();
        
        let discipline_row: Option<DisciplineIdLookup> = self.find_one_tx(
            tx,
            "SELECT c.discipline_id FROM studyitem s 
            JOIN content c ON s.content_id = c.id 
            WHERE s.id = ?",
            vec![JsonValue::from(study_item_id)],
        ).await?;

        if let Some(data) = discipline_row {
            let discipline_id = data.discipline_id; // Acesso direto, sem .get()
            
            let last_log: Option<ReviewLogLookup> = self.find_one_tx(
                    tx,
                    "SELECT evaluation FROM reviewlog 
                     WHERE study_item_id = 3
                     ORDER BY review_time DESC LIMIT 1 OFFSET 1",
                    vec![JsonValue::from(study_item_id)],
                ).await?;

            let was_positive = last_log.map(|l| {
                matches!(l.evaluation.as_str(), "CORRECT" | "EASY" | "MEDIUM")
            }).unwrap_or(false);

            let is_positive_now = matches!(evaluation.as_str(), "CORRECT" | "EASY" | "MEDIUM");

            let increment = match (was_positive, is_positive_now) {
                (true, true) => 0,
                (false, false) => 0,
                (true, false) => -1,
                (false, true) => 1,
            };

            // C. Update Itens Masterizados e Data
            self.execute_tx(
                tx,
                "UPDATE discipline_progress 
                    SET items_mastered = MIN(total_items, MAX(0, items_mastered + ?)), 
                    last_review_date = ?
                    WHERE user_id = ? AND discipline_id = ?",
                vec![
                    JsonValue::from(increment),
                    JsonValue::String(now),
                    JsonValue::from(user_id),
                    JsonValue::from(discipline_id),
                ],
            ).await?;

            // D. Update Porcentagem
            self.execute_tx(
                tx,
                "UPDATE discipline_progress 
                    SET progress_percent = ROUND((CAST(items_mastered AS REAL) * 100.0) / MAX(total_items, 1), 2)
                    WHERE user_id = ? AND discipline_id = ?",
                vec![
                    JsonValue::from(user_id), 
                    JsonValue::from(discipline_id)
                ],
            ).await?;
        }

        Ok(())
    }
}

impl<'a> MutationRepository for DisciplineRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}

impl<'a> QueryRepository for DisciplineRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}

impl<'a> EntityRepository<Discipline> for DisciplineRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}

impl<'a> EntityRepository<DisciplineIdLookup> for DisciplineRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}


impl<'a> EntityRepository<ReviewLogLookup> for DisciplineRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}