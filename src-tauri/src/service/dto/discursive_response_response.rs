use crate::model::discursive_response::DiscursiveResponse;

#[derive(serde::Serialize)]
pub struct DiscursiveResponseResponse {
    pub id: i64,
    pub question_id: i64,
    pub expected_answer: String,
    pub evaluation_criteria: Option<String>,
}

impl From<&DiscursiveResponse> for DiscursiveResponseResponse {
    fn from(response: &DiscursiveResponse) -> Self {
        Self {
            id: response.id,
            question_id: response.question_id,
            expected_answer: response.expected_answer.clone(),
            evaluation_criteria: response.evaluation_criteria.clone(),
        }
    }
}
