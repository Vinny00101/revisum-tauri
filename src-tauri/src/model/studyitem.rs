use chrono::{DateTime, Utc};


#[derive(Debug, Clone, sqlx::FromRow)]
pub struct studyitem{
    pub id: i64,
    pub content_id: i64,
    pub item_type: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}