use chrono::{DateTime, Utc};

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct Content{
    pub id: i64,
    pub discipline_id: i64,
    pub title: String,
    pub description: Option<String>,
    pub display_order: i64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}


#[derive(Debug, Clone, sqlx::FromRow)]
pub struct UpdateContent{
    pub title: Option<String>,
    pub description: Option<String>,
    pub display_order: Option<i64>,
}
