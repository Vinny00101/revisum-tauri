use tauri::{command, State};


use crate::{
    db::config::DbStore, filesystem::AppPaths, service::{dto::{message_response::Message, user_response::UpdateUserRes}, service_factory::ServiceFactory, user_service::{Auth, ReviewlogResponse}}
};


#[command(rename_all = "snake_case")]
pub async fn create_user_command(
    state: State<'_, DbStore>,
    username: String,
    password: String,
    email: String,
) -> Result<Message, String> {
    let service = ServiceFactory::user(state.clone());

    service.create_user(state, username, password, email).await.map_err(|e|e.to_frontend())
}

#[command(rename_all = "snake_case")]
pub async fn update_user_command(
    state: State<'_, DbStore>,
    paths: State<'_, AppPaths>,
    user_id: i64,
    update: UpdateUserRes,
)-> Result<Message, String> {
    let service = ServiceFactory::user(state.clone());

    service.update_user(state, &paths, user_id, update).await.map_err(|e|e.to_frontend())
}

#[command(rename_all = "snake_case")]
pub async fn get_current_user_command(
    state: State<'_, DbStore>,
    user_id: i64,
) -> Result<Auth, String> {
    let service = ServiceFactory::user(state.clone());

    service.get_current_user(user_id).await.map_err(|e|e.to_frontend())
}

#[command(rename_all = "snake_case")]
pub async fn authentication_user_command(
    state: State<'_, DbStore>,
    username: String,
    password: String,
)-> Result<Auth, String>{
    let service = ServiceFactory::user(state);

    service.authentication_user(username, password).await.map_err(|e|e.to_frontend())
}

#[command(rename_all = "snake_case")]
pub async fn get_review_log_command(
    state: State<'_, DbStore>,
    user_id: i64,
) -> Result<ReviewlogResponse, String>{
    let service = ServiceFactory::user(state);

    service.get_review_log(user_id).await.map_err(|e|e.to_frontend())
}   