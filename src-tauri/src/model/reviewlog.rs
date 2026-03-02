use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, sqlx::FromRow, Serialize, Deserialize)]
pub struct Reviewlog{
    pub id: i64,
    pub session_id: i64,
    pub user_id: i64,
    pub study_item_id: i64,
    pub item_type: String,
    pub evaluation: String,
    pub time_spent: Option<i64>,
    pub review_time: String,
}