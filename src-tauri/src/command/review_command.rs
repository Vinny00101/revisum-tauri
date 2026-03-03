use tauri::{command, State};

use crate::{db::config::DbStore, model::session::UpdateReviewSession, repository::session_repository::ReviewLogInput, service::{dto::message_response::Message, review_service::{CreateSessionMessage, SessionDataAll, SessionDataOne}, service_factory::ServiceFactory}};

#[command(rename_all = "snake_case")]
pub async fn create_session_review_command(
    state: State<'_, DbStore>,
    user_id: i64,
    discipline_id: i64,
    content_id: i64,
    session_type: String,
) -> Result<CreateSessionMessage, String>{
    let service = ServiceFactory::review(state);

    service.create_session_review(user_id, discipline_id, content_id, session_type).await.map_err(|e| e.to_frontend())
}

#[command(rename_all = "snake_case")]
pub async fn update_session_review_command(
    state: State<'_, DbStore>,
    session_id: i64,
    user_id: i64,
    update: UpdateReviewSession,
) -> Result<Message, String>{
    let service = ServiceFactory::review(state.clone());

    service.update_session_review(state,session_id, user_id, update).await.map_err(|e| e.to_frontend())
}

#[command(rename_all = "snake_case")]
pub async fn get_all_session_review_command(
    state: State<'_, DbStore>,
    user_id: i64,
) -> Result<SessionDataAll, String>{
    let service = ServiceFactory::review(state);

    service.get_all_session_review(user_id).await.map_err(|e| e.to_frontend())
}

#[command(rename_all = "snake_case")]
pub async fn get_one_session_review_command(
    state: State<'_, DbStore>,
    session_id: i64,
) -> Result<SessionDataOne, String>{
    let service = ServiceFactory::review(state);

    service.get_session_review(session_id).await.map_err(|e| e.to_frontend())
}

#[command(rename_all = "snake_case")]
pub async fn save_item_review_command(
    state: State<'_, DbStore>,
    input: ReviewLogInput,
) -> Result<Message, String>{
    let service = ServiceFactory::review(state.clone());
    
    service.save_item_review(state, input).await.map_err(|e| e.to_frontend())
}

#[command(rename_all = "snake_case")]
pub async fn cancel_session_review_command(
    state: State<'_, DbStore>,
    session_id: i64,
    user_id: i64,
) -> Result<Message, String>{
    let service = ServiceFactory::review(state);

    service.cancel_session_review(session_id, user_id).await.map_err(|e| e.to_frontend())
}