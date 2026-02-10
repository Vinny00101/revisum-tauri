use chrono::{DateTime, Utc};

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct Question {
    pub id: i64,
    pub study_item_id: i64,
    pub question_type: String, // OBJECTIVE | DISCURSIVE
    pub statement_text: String,
    pub statement_image: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct UpdateQuestion {
    pub statement_text: Option<String>,
    pub statement_image: Option<String>,
}

impl UpdateQuestion {
    pub fn new(
        statement_text: Option<String>,
        statement_image: Option<String>,
    ) -> Self {
        Self {
            statement_text,
            statement_image,
        }
    }
}
