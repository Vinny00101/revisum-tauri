use chrono::{DateTime, Utc};
use sqlx::FromRow;

#[derive(Debug, Clone, FromRow)]
pub struct UserStatus {
    pub user_id: i64,
    pub current_streak: i32,
    pub longest_streak: i32,
    pub last_review_date: Option<DateTime<Utc>>,
    pub total_study_time: i64, // Representando minutos ou segundos
}