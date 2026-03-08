#[derive(Debug, Clone, sqlx::FromRow)]
pub struct DiscursiveResponse {
    pub id: i64,
    pub question_id: i64,
    pub expected_answer: String,
    pub evaluation_criteria: Option<String>,
}