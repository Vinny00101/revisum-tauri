use tauri::State;

use crate::{db::config::DbStore, repository::{card_repository::CardRepository, content_repository::ContentRepository, discipline_repository::DisciplineRepository, discursive_response_repository::DiscursiveResponseRepository, objective_answer_repository::ObjectiveAnswerRepository, question_repository::QuestionRepository, studyi_item_repository::StudyItemRepository, user_repository::UserRepository}, service::{content_service::ContentService, discipline_service::DisciplineService, study_item_service::StudyItemService}};

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

    pub fn study_item<'a>(state: State<'a, DbStore>) -> StudyItemService<'a> {
        StudyItemService::new(
            StudyItemRepository::new(state.clone()), 
            CardRepository::new(state.clone()), 
            QuestionRepository::new(state.clone()), 
            ObjectiveAnswerRepository::new(state.clone()), 
            DiscursiveResponseRepository::new(state.clone()), 
            UserRepository::new(state.clone()), 
            ContentRepository::new(state)
        )
    }
}
