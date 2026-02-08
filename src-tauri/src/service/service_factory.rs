use tauri::State;

use crate::{db::config::DbStore, repository::{content_repository::ContentRepository, discipline_repository::DisciplineRepository, user_repository::UserRepository}, service::{content_service::ContentService, discipline_service::DisciplineService}};

pub struct ServiceFactory;

impl ServiceFactory {
    pub fn discipline<'a>(state: State<'a, DbStore>) -> DisciplineService<'a> {
        DisciplineService::new(
            DisciplineRepository::new(state.clone()),
            UserRepository::new(state),
        )
    }

    pub fn content<'a>(state: State<'a, DbStore>) -> ContentService<'a> {
        ContentService::new(
            ContentRepository::new(state.clone()),
            DisciplineRepository::new(state.clone()), 
        )
    }
}
