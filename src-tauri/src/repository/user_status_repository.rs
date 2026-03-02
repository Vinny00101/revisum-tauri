use crate::db::db_methods::ExecuteResult;
use crate::model::user_status::UserStatus; // Ajuste o path conforme seu projeto
use crate::repository::base_repository::{EntityRepository, QueryRepository, MutationRepository};
use crate::db::config::DbStore;
use crate::error::app_error::AppError;
use serde_json::Value as JsonValue;
use sqlx::{Sqlite, Transaction};
use tauri::State;

pub(crate) struct UserStatusRepository<'a> {
    state: State<'a, DbStore>,
}

impl<'a> UserStatusRepository<'a> {
    pub fn new(state: State<'a, DbStore>) -> Self {
        Self { state }
    }

    /// Cria o registro inicial de status para um novo usuário
    pub async fn create_initial_status_tx(
        &self, 
        tx: &mut Transaction<'_, Sqlite>,
        user_id: i64
    ) -> Result<ExecuteResult, AppError> {
        let values = vec![
            JsonValue::from(user_id),
            JsonValue::from(0), // current_streak
            JsonValue::from(0), // longest_streak
            JsonValue::from(0), // total_study_time
        ];

        self.execute_tx(
            tx,
            "INSERT INTO user_status (user_id, current_streak, longest_streak, total_study_time) VALUES (?, ?, ?, ?)",
            values,
        ).await
    }

    pub async fn update_streak_logic_tx(
        &self, 
        tx: &mut Transaction<'_, Sqlite>,
        user_id: i64,
    ) -> Result<(), AppError> {
        let status: Option<UserStatus> = self.find_one_tx(
            tx,
            "SELECT * FROM user_status WHERE user_id = ?",
            vec![JsonValue::from(user_id)]
        ).await?;

        let now: chrono::NaiveDate = chrono::Local::now().date_naive();
        let today_str = now.to_string();

        if let Some(s) = status {
            if s.last_review_date.as_deref() == Some(&today_str) {
                return Ok(());
            }

            let yesterday = now.pred_opt().unwrap_or(now);
            let was_yesterday = s.last_review_date.as_deref() == Some(&yesterday.to_string());

            if was_yesterday || s.current_streak == 0 {
                // Incrementa
                self.execute_tx(
                    tx,
                    "UPDATE user_status SET 
                        current_streak = current_streak + 1,
                        longest_streak = MAX(longest_streak, current_streak + 1),
                        last_review_date = ?
                     WHERE user_id = ?",
                    vec![JsonValue::String(today_str), JsonValue::from(user_id)]
                ).await?;
            } else {
                // Perdeu o streak (estudou há mais de 2 dias), reseta para 1
                self.execute_tx(
                    tx,
                    "UPDATE user_status SET 
                        current_streak = 1,
                        last_review_date = ?
                     WHERE user_id = ?",
                    vec![JsonValue::String(today_str), JsonValue::from(user_id)]
                ).await?;
            }
        }
        Ok(())
    }

    /// Busca os status de um usuário pelo ID
    pub async fn get_by_user_id(&self, user_id: i64) -> Result<Option<UserStatus>, AppError> {
        self.find_one(
            "SELECT * FROM user_status WHERE user_id = ?",
            vec![JsonValue::from(user_id)]
        ).await
    }
    /*
    /// Atualiza o tempo de estudo somando os novos minutos/segundos
    pub async fn add_study_time(&self, user_id: i64, time_to_add: i64) -> Result<ExecuteResult, AppError> {
        self.execute(
            "UPDATE user_status SET total_study_time = total_study_time + ? WHERE user_id = ?",
            vec![JsonValue::from(time_to_add), JsonValue::from(user_id)]
        ).await
    }

    /// Incrementa a ofensiva e atualiza o recorde se necessário
    pub async fn increment_streak(&self, user_id: i64) -> Result<ExecuteResult, AppError> {
        let now = chrono::Utc::now().to_rfc3339();
        
        self.execute(
            "UPDATE user_status 
             SET current_streak = current_streak + 1, 
                 longest_streak = MAX(longest_streak, current_streak + 1),
                 last_review_date = ? 
             WHERE user_id = ?",
            vec![JsonValue::String(now), JsonValue::from(user_id)]
        ).await
    }
    */
}

// Implementações dos Traits do Base Repository

impl<'a> MutationRepository for UserStatusRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}

impl<'a> QueryRepository for UserStatusRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}

impl<'a> EntityRepository<UserStatus> for UserStatusRepository<'a> {
    fn get_state(&self) -> &State<'_, DbStore> {
        &self.state
    }
}