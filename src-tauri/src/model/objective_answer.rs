#[derive(Debug, Clone, sqlx::FromRow)]
pub struct objective_answer{
    pub id: i64,
    pub question_id: i64,
    pub text: String,
    pub image: Option<String>,
    pub is_correct: i64,
}