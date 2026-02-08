use tauri::{command, State};

use crate::{db::config::DbStore, service::{content_service::{ContentDataAll, ContentDataOne}, dto::message_response::Message, service_factory::ServiceFactory}};

#[command(rename_all = "snake_case")]
pub async fn create_content_command(
    state: State<'_, DbStore>,
    user_id: i64,
    discipline_id: i64,
    title: String,
    description: Option<String>,
    display_order: i64
) -> Result<Message, String>{
    let service = ServiceFactory::content(state);

    service.create_content(user_id, discipline_id, title, description, display_order).await.map_err(|e| e.to_frontend())
}


#[command(rename_all = "snake_case")]
pub async fn update_content_command(
    state: State<'_, DbStore>,
    user_id: i64,
    discipline_id: i64,
    content_id: i64,
    title: Option<String>,
    description: Option<String>,
    display_order: Option<i64>
) -> Result<Message, String>{
    let service = ServiceFactory::content(state);

    service.update_content(user_id, discipline_id, content_id, title, description, display_order).await.map_err(|e| e.to_frontend())
}

#[command(rename_all = "snake_case")]
pub async fn get_all_content_command(
    state: State<'_, DbStore>,
    user_id: i64,
    discipline_id: i64,
) -> Result<ContentDataAll, String>{
    let service = ServiceFactory::content(state);

    service.get_all_content(user_id, discipline_id).await.map_err(|e| e.to_frontend())
}

#[command(rename_all = "snake_case")]
pub async fn get_content_command(
    state: State<'_, DbStore>,
    user_id: i64,
    content_id: i64,
    discipline_id: i64,
) -> Result<ContentDataOne, String>{
    let service = ServiceFactory::content(state);

    service.get_content(user_id, content_id, discipline_id).await.map_err(|e| e.to_frontend())
}

#[command(rename_all = "snake_case")]
pub async fn delete_content_command(
    state: State<'_, DbStore>,
    user_id: i64,
    content_id: i64,
    discipline_id: i64,
) -> Result<Message, String>{
    let service = ServiceFactory::content(state);

    service.delete_content(user_id, content_id, discipline_id).await.map_err(|e| e.to_frontend())
}