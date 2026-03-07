use tauri::State;

use crate::{db::config::DbStore, repository::{card_repository::CardRepository, content_repository::ContentRepository, discipline_repository::DisciplineRepository, discursive_response_repository::DiscursiveResponseRepository, objective_answer_repository::ObjectiveAnswerRepository, question_repository::QuestionRepository, reviewlog_repository::ReviewLogRepository, session_repository::SessionRepository, studyi_item_repository::StudyItemRepository, user_repository::UserRepository, user_status_repository::UserStatusRepository}, service::{content_service::ContentService, discipline_service::DisciplineService, review_service::ReviewService, study_item_service::StudyItemService, user_service::UserService}};

pub struct ServiceFactory;

impl ServiceFactory {
    pub fn user<'a>(state: State<'a, DbStore>) -> UserService<'a> {
        UserService::new(
            UserRepository::new(state.clone()), 
            UserStatusRepository::new(state.clone()),
            ReviewLogRepository::new(state)
        )
    }
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
            DisciplineRepository::new(state.clone()), 
            ContentRepository::new(state)
        )
    }

    pub fn review<'a>(state: State<'a, DbStore>) -> ReviewService<'a> {
        ReviewService::new(
            SessionRepository::new(state.clone()),
            UserRepository::new(state.clone()),
            UserStatusRepository::new(state.clone()),
            DisciplineRepository::new(state.clone()),
            QuestionRepository::new(state.clone()),
            ObjectiveAnswerRepository::new(state.clone()),
            ContentRepository::new(state)
        )
    }
}
