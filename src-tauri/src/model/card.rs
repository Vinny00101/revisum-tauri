use chrono::{DateTime, Utc};

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct card{
    pub id: i64,
    pub study_item_id: i64,
    pub front: String,
    pub back: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}