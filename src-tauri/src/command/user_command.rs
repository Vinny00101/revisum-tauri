use tauri::{command, State};


use crate::{
    db::config::DbStore,
    repository::user_repository::UserRepository,
    service::user_service::{Message, UserService},
};


#[command(rename_all = "snake_case")]
pub async fn create_user_command(
    state: State<'_, DbStore>,
    username: String,
    password: String,
    email: String,
) -> Result<Message, String> {
    let user_repository = UserRepository::new(state);
    let user_service = UserService::new(user_repository);

    user_service.create_user(username, password, email).await.map_err(|e|e.to_frontend())
}