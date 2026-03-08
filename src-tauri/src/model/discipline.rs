use chrono::{DateTime, Utc};

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct Discipline{
    pub id: i64,
    pub user_id: i64,
    pub name: String,
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub total_items: i32,
    pub items_mastered: i32,
    pub progress_percent: f64,
    pub last_review_date: Option<String>,
}

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct UpdateDiscipline {
    pub name: Option<String>,
    pub description: Option<String>,
}

impl UpdateDiscipline {
    pub fn new(name: Option<String>, description: Option<String>,) -> Self {
        Self { name, description }
    }
}