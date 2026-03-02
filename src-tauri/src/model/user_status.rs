use serde::Serialize;
use sqlx::FromRow;

#[derive(Debug, Clone, FromRow, Serialize)]
pub struct UserStatus {
    pub user_id: i64,
    pub current_streak: i32,
    pub longest_streak: i32,
    pub last_review_date: Option<String>,
    pub total_study_time: i64,
}