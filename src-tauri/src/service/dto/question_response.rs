use chrono::{DateTime, Utc};

use crate::model::question::Question;

#[derive(serde::Serialize)]
pub struct QuestionResponse {
    pub id: i64,
    pub study_item_id: i64,
    pub question_type: String,
    pub statement_text: String,
    pub statement_image: Option<String>,
    #[serde(serialize_with = "crate::utils::datetime::serialize")]
    pub created_at: DateTime<Utc>,
    #[serde(serialize_with = "crate::utils::datetime::serialize")]
    pub updated_at: DateTime<Utc>,
}

impl From<&Question> for QuestionResponse {
    fn from(question: &Question) -> Self {
        Self {
            id: question.id,
            study_item_id: question.study_item_id,
            question_type: question.question_type.clone(),
            statement_text: question.statement_text.clone(),
            statement_image: question.statement_image.clone(),
            created_at: question.created_at,
            updated_at: question.updated_at,
        }
    }
}
