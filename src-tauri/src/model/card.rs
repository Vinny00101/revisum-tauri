use chrono::{DateTime, Utc};

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct Card{
    pub id: i64,
    pub study_item_id: i64,
    pub front: String,
    pub back: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct UpdateCard {
    pub front: Option<String>,
    pub back: Option<String>,
}

impl UpdateCard {
    pub fn new(front: Option<String>, back: Option<String>) -> Self {
        Self { front, back }
    }
}
