use chrono::{DateTime, Utc};

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct question{
    pub id: i64,
    pub study_item_id: i64,
    pub question_type: String,
    pub statement_text: String,
    pub statement_image: Option<String>,
    pub is_correct: i64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}