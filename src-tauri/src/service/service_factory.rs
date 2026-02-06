use tauri::State;

use crate::{db::config::DbStore, repository::{discipline_repository::DisciplineRepository, user_repository::UserRepository}, service::discipline_service::DisciplineService};

pub struct ServiceFactory;

impl ServiceFactory {
    pub fn discipline(state: State<'_, DbStore>) -> DisciplineService {
        DisciplineService::new(
            DisciplineRepository::new(state.clone()),
            UserRepository::new(state),
        )
    }
}
