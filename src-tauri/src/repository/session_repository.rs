use crate::{
    db::{config::DbStore, db_methods::ExecuteResult},
    error::app_error::AppError,
    model::session::{Accuracy, ReviewSession, UpdateReviewSession},
    repository::base_repository::{EntityRepository, MutationRepository, QueryRepository},
};
use serde_json::Value as JsonValue;
use sqlx::{Sqlite, Transaction};
use tauri::State;

#[derive(Debug, serde::Deserialize)]
pub struct ReviewLogInput {
    pub session_id: i64,
    pub user_id: i64,
    pub study_item_id: i64,
    pub item_type: String,
    pub evaluation: String, // 'WRONG', 'HARD', 'MEDIUM', 'EASY', 'CORRECT'
    pub time_spent: i64,
}

#[derive(Debug, sqlx::FromRow)]
pub struct StudyItemState {
    pub ease_factor: f64,
    pub interval_days: i64,
    pub repetition: i64,
}

pub(crate) struct SessionRepository<'a> {
    state: State<'a, DbStore>,
}

impl<'a> SessionRepository<'a> {
    pub fn new(state: State<'a, DbStore>) -> Self {
        Self { state }
    }

    /// Cria uma nova sessão e retorna o ID gerado
    pub async fn create_session(
        &self,
        user_id: i64,
        discipline_id: i64,
        content_id: i64,
        session_type: String,
    ) -> Result<ExecuteResult, AppError> {
        let now = chrono::Utc::now().to_rfc3339();

        let values = vec![
            JsonValue::from(user_id),
            JsonValue::from(discipline_id),
            JsonValue::from(content_id),
            JsonValue::String(session_type),
            JsonValue::String(now),
        ];

        self.execute(
            "INSERT INTO review_session (user_id, discipline_id, content_id, session_type, start_time) VALUES (?, ?, ?, ?, ?)",
            values,
        ).await
    }

    /// Atualiza os dados da sessão (geralmente chamado ao finalizar)
    pub async fn update_session_tx(
        &self,
        tx: &mut Transaction<'_, Sqlite>,
        session_id: i64,
        update: UpdateReviewSession,
    ) -> Result<ExecuteResult, AppError> {
        let mut fields = Vec::new();
        let mut values = Vec::new();

        if let Some(end_time) = update.end_time {
            fields.push("end_time = ?");
            values.push(JsonValue::String(end_time));
        }

        if let Some(total) = update.total_items {
            fields.push("total_items = ?");
            values.push(JsonValue::from(total));
        }

        if let Some(correct) = update.correct_items {
            fields.push("correct_items = ?");
            values.push(JsonValue::from(correct));
        }

        if let Some(acc) = update.accuracy {
            fields.push("accuracy = ?");
            values.push(JsonValue::from(acc));
        }

        if fields.is_empty() {
            return Err(AppError::InvalidInput(
                "Nada para atualizar na sessão".into(),
            ));
        }

        values.push(JsonValue::from(session_id));

        let query = format!(
            "UPDATE review_session SET {} WHERE id = ?",
            fields.join(", "),
        );

        self.execute_tx(tx, &query, values).await
    }

    /// Obtém uma sessão específica
    pub async fn get_session(&self, id: i64) -> Result<Option<ReviewSession>, AppError> {
        self.find_one(
            "SELECT * FROM review_session WHERE id = ?",
            vec![JsonValue::from(id)],
        )
        .await
    }

    /// Obtém todas as sessões de um usuário específico
    pub async fn get_all_user_sessions(
        &self,
        user_id: i64,
    ) -> Result<Vec<ReviewSession>, AppError> {
        self.find_all(
            "SELECT * FROM review_session WHERE user_id = ? ORDER BY start_time DESC",
            vec![JsonValue::from(user_id)],
        )
        .await
    }

    pub async fn exists_by_id(&self, id: i64) -> Result<bool, AppError> {
        self.exists(
            "SELECT 1 FROM review_session WHERE id = ? LIMIT 1",
            vec![JsonValue::from(id)],
        )
        .await
    }

    #[allow(dead_code)]
    /// Obtém sessões por conteúdo (útil para histórico específico)
    pub async fn get_sessions_by_content(
        &self,
        content_id: i64,
    ) -> Result<Vec<ReviewSession>, AppError> {
        self.find_all(
            "SELECT * FROM review_session WHERE content_id = ? ORDER BY start_time DESC",
            vec![JsonValue::from(content_id)],
        )
        .await
    }

    pub async fn save_item_review_tx(&self, 
        tx: &mut Transaction<'_, Sqlite>,
        input: ReviewLogInput
    ) -> Result<ExecuteResult, AppError> {
        // 1. Inserir o Log na tabela reviewlog
        self.execute_tx(
        tx,
        "INSERT INTO reviewlog (session_id, user_id, study_item_id, item_type, evaluation, time_spent, review_time) 
            VALUES (?, ?, ?, ?, ?, ?, ?)",
        vec![
            JsonValue::from(input.session_id),
            JsonValue::from(input.user_id),
            JsonValue::from(input.study_item_id),
            JsonValue::String(input.item_type.clone()),
            JsonValue::String(input.evaluation.clone()),
            JsonValue::from(input.time_spent),
            JsonValue::String(chrono::Utc::now().to_rfc3339()),
        ],
        ).await?;

        // 2. Buscar estado atual ou definir padrão (StudyItemState)
        // Usamos find_one_tx para buscar dentro da mesma transação
        let state: StudyItemState = self
            .find_one_tx(
                tx,
                "SELECT ease_factor, interval_days, repetition FROM study_item_review_state 
            WHERE user_id = ? AND study_item_id = ?",
                vec![
                    JsonValue::from(input.user_id),
                    JsonValue::from(input.study_item_id),
                ],
            )
            .await?
            .unwrap_or(StudyItemState {
                ease_factor: 2.5,
                interval_days: 0,
                repetition: 0,
            });

        // 3. Lógica do Algoritmo SM-2 (Calculando novos valores)
        let (new_repetition, new_interval, new_ease) = match input.evaluation.as_str() {
            "WRONG" => (0, 1, (state.ease_factor - 0.2).max(1.3)),
            "HARD" => (
                state.repetition + 1,
                (state.interval_days as f64 * 1.2) as i64 + 1,
                (state.ease_factor - 0.15).max(1.3),
            ),
            "MEDIUM" => (
                state.repetition + 1,
                (state.interval_days as f64 * state.ease_factor) as i64 + 1,
                state.ease_factor,
            ),
            "EASY" => (
                state.repetition + 1,
                (state.interval_days as f64 * state.ease_factor * 1.3) as i64 + 2,
                state.ease_factor + 0.15,
            ),
            _ => (state.repetition, 1, state.ease_factor), // Caso padrão para 'CORRECT'
        };

        let next_review = chrono::Utc::now() + chrono::Duration::days(new_interval);

        // 4. Upsert no Estado (study_item_review_state)
        self.execute_tx(
        tx,
        "INSERT INTO study_item_review_state (user_id, study_item_id, ease_factor, interval_days, repetition, last_review_date, next_review_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id, study_item_id) DO UPDATE SET
                ease_factor = excluded.ease_factor,
                interval_days = excluded.interval_days,
                repetition = excluded.repetition,
                last_review_date = excluded.last_review_date,
                next_review_date = excluded.next_review_date",
        vec![
            JsonValue::from(input.user_id),
            JsonValue::from(input.study_item_id),
            JsonValue::from(new_ease),
            JsonValue::from(new_interval),
            JsonValue::from(new_repetition),
            JsonValue::String(chrono::Utc::now().to_rfc3339()),
            JsonValue::String(next_review.to_rfc3339()),
        ],
        ).await
    }

    pub async fn delete(
        &self,
        id: i64,
    ) -> Result<ExecuteResult, AppError> {
        self.execute(
            "DELETE FROM review_session WHERE id = ?",
            vec![JsonValue::from(id)]
        ).await
    }

    pub async fn get_acurracy_geral_session(
        &self,
        tx: &mut Transaction<'_, Sqlite>,
        user_id: i64,
    ) -> Result<Option<Accuracy>, AppError> {
        self.find_one_tx(
            tx, 
        "SELECT 
                SUM(correct_items) as total_correct,
                SUM(total_items) as total_itens,
                (CAST(SUM(correct_items) AS REAL) / SUM(total_items)) * 100 as accuracy
            FROM review_session WHERE review_session.user_id = ?" ,
            vec![JsonValue::from(user_id)]
        ).await
    }

}

// Implementações das Traits para manter o padrão do seu BaseRepository
impl<'a> MutationRepository for SessionRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}

impl<'a> QueryRepository for SessionRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}

impl<'a> EntityRepository<ReviewSession> for SessionRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}

impl<'a> EntityRepository<StudyItemState> for SessionRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}

impl<'a> EntityRepository<Accuracy> for SessionRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}
