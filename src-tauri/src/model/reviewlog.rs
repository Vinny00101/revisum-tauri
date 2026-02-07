use chrono::{DateTime, Utc};

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct reviewlog{
    pub id: i64,
    pub user_id: i64,
    pub study_item_id: i64,
    pub item_type: String,
    pub evaluation: String,
    pub statement_image: String,
    pub time_spent: Option<i64>,
    pub review_time: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}