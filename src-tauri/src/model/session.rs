use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct ReviewSession {
    pub id: i64,
    pub user_id: i64,
    pub discipline_id: i64,
    pub content_id: i64,
    pub session_type: String, // 'CARD', 'OBJECTIVE', 'DISCURSIVE'
    pub start_time: String,
    pub end_time: Option<String>,
    pub total_items: i64,
    pub correct_items: Option<i64>,
    pub accuracy: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateReviewSession {
    pub end_time: Option<String>,
    pub total_items: Option<i64>,
    pub correct_items: Option<i64>,
    pub accuracy: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Accuracy{
    pub total_correct: i64,
    pub total_itens: i64,
    pub accuracy: f64,
}