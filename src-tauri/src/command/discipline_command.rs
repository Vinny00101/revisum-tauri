use tauri::{command, State};

use crate::{db::config::DbStore, service::{discipline_service::{DisciplineDataAll, DisciplineDataOne}, dto::message_response::Message, service_factory::ServiceFactory}};



#[command(rename_all = "snake_case")]
pub async fn create_discipline_command(
    state: State<'_, DbStore>,
    user_id: i64,
    name: String,
    description: Option<String>,
) -> Result<Message, String>{
    let service = ServiceFactory::discipline(state);

    service.create_discipline(user_id, name, description).await.map_err(|e| e.to_frontend())
}

#[command(rename_all = "snake_case")]
pub async fn delete_discipline_command(
    state: State<'_, DbStore>,
    user_id: i64,
    discipline_id: i64,
) -> Result<Message, String>{
    let service = ServiceFactory::discipline(state);

    service.delete_discipline(user_id,discipline_id).await.map_err(|e| e.to_frontend())
}

#[command(rename_all = "snake_case")]
pub async fn update_discipline_command(
    state: State<'_, DbStore>,
    user_id: i64,
    discipline_id: i64,
    name: Option<String>,
    description: Option<String>,
) -> Result<Message, String>{
    let service = ServiceFactory::discipline(state);

    service.update_discipline(user_id, discipline_id, name, description).await.map_err(|e| e.to_frontend())
}

#[command(rename_all = "snake_case")]
pub async fn get_all_discipline_command(
    state: State<'_, DbStore>,
    user_id: i64,
) -> Result<DisciplineDataAll, String>{
    let service = ServiceFactory::discipline(state);

    service.get_all_discipline(user_id).await.map_err(|e| e.to_frontend())
}

#[command(rename_all = "snake_case")]
pub async fn get_discipline_command(
    state: State<'_, DbStore>,
    user_id: i64,
    discipline_id: i64,
) -> Result<DisciplineDataOne, String>{
    let service = ServiceFactory::discipline(state);

    service.get_discipline(user_id, discipline_id).await.map_err(|e| e.to_frontend())
}