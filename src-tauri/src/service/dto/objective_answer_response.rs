use crate::model::objective_answer::ObjectiveAnswer;

#[derive(serde::Serialize)]
pub struct ObjectiveAnswerResponse {
    pub id: i64,
    pub question_id: i64,
    pub text: String,
    pub image: Option<String>,
    pub is_correct: bool,
}

impl From<&ObjectiveAnswer> for ObjectiveAnswerResponse {
    fn from(answer: &ObjectiveAnswer) -> Self {
        Self {
            id: answer.id,
            question_id: answer.question_id,
            text: answer.text.clone(),
            image: answer.image.clone(),
            is_correct: answer.is_correct == 1,
        }
    }
}
