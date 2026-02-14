use tauri::{command, State};

use crate::{
    db::config::DbStore, filesystem::AppPaths, service::{
        dto::message_response::Message,
        service_factory::ServiceFactory,
        study_item_service::{CreateStudyItemInput, StudyItemDataAll, StudyItemDataOne},
    }
};

#[command(rename_all = "snake_case")]
pub async fn create_study_item_command(
    state: State<'_, DbStore>,
    paths: State<'_, AppPaths>,
    user_id: i64,
    input: CreateStudyItemInput,
) -> Result<Message, String> {
    let service = ServiceFactory::study_item(state.clone());

    service
        .create_study_item_tx(state, &paths, user_id, input)
        .await
        .map_err(|e| e.to_frontend())
}

#[command(rename_all = "snake_case")]
pub async fn get_all_study_item_command(
    state: State<'_, DbStore>,
    user_id: i64,
    content_id: i64,
) -> Result<StudyItemDataAll, String> {
    let service = ServiceFactory::study_item(state);

    service
        .get_all_study_item_by_content(user_id, content_id)
        .await
        .map_err(|e| e.to_frontend())
}

#[command(rename_all = "snake_case")]
pub async fn get_study_item_command(
    state: State<'_, DbStore>,
    study_item_id: i64,
    user_id: i64,
    content_id: i64,
) -> Result<StudyItemDataOne, String> {
    let service = ServiceFactory::study_item(state);

    service
        .get_study_item_by_content(study_item_id, user_id, content_id)
        .await
        .map_err(|e| e.to_frontend())
}

#[command(rename_all = "snake_case")]
pub async fn delete_study_item_command(
    state: State<'_, DbStore>,
    study_item_id: i64,
    user_id: i64,
    content_id: i64,
) -> Result<Message, String> {
    let service = ServiceFactory::study_item(state.clone());

    service
        .delete_study_item_by_content(state, study_item_id, user_id, content_id)
        .await
        .map_err(|e| e.to_frontend())
}
