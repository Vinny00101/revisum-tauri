use tauri::State;

use crate::{
    db::{
        config::DbStore,
        db_methods::{db_begin_tx, db_commit_tx},
    },
    error::app_error::AppError,
    model::session::{ReviewSession, UpdateReviewSession},
    repository::{
        content_repository::ContentRepository, discipline_repository::DisciplineRepository, objective_answer_repository::ObjectiveAnswerRepository, question_repository::QuestionRepository, session_repository::{ReviewLogInput, SessionRepository}, user_repository::UserRepository, user_status_repository::UserStatusRepository
    },
    service::dto::message_response::Message,
};

#[derive(serde::Serialize)]
pub struct CreateSessionMessage {
    pub message: Message,
    pub session_id: i64,
}

#[derive(serde::Serialize)]
pub struct SessionDataOne {
    pub message: Message,
    pub session: Option<ReviewSession>,
}

#[derive(serde::Serialize)]
pub struct SessionDataAll {
    pub message: Message,
    pub sessions: Option<Vec<ReviewSession>>,
}

#[derive(Debug, serde::Deserialize)]
pub struct ReviewQuestionObjInput {
    pub session_id: i64,
    pub user_id: i64,
    pub question_id: i64,
    pub item_type: String,
    pub option_id: i64,
    pub time_spent: i64,
}

pub struct ReviewService<'a> {
    session_repository: SessionRepository<'a>,
    user_repository: UserRepository<'a>,
    user_status_repository: UserStatusRepository<'a>,
    discipline_repository: DisciplineRepository<'a>,
    question_repository: QuestionRepository<'a>,
    objective_answer_repository: ObjectiveAnswerRepository<'a>,
    content_repository: ContentRepository<'a>,
}

impl<'a> ReviewService<'a> {
    pub fn new(
        session_repository: SessionRepository<'a>,
        user_repository: UserRepository<'a>,
        user_status_repository: UserStatusRepository<'a>,
        discipline_repository: DisciplineRepository<'a>,
        question_repository: QuestionRepository<'a>,
        objective_answer_repository: ObjectiveAnswerRepository<'a>,
        content_repository: ContentRepository<'a>,
    ) -> Self {
        Self {
            session_repository,
            user_repository,
            user_status_repository,
            discipline_repository,
            question_repository,
            objective_answer_repository,
            content_repository,
        }
    }

    pub async fn create_session_review(
        &self,
        user_id: i64,
        discipline_id: i64,
        content_id: i64,
        session_type: String,
    ) -> Result<CreateSessionMessage, AppError> {
        if !self.user_repository.exists_by_id(user_id).await? {
            return Ok(CreateSessionMessage {
                message: Message {
                    code: false,
                    message: "Usuário não encontrado".into(),
                },
                session_id: 0,
            });
        }

        if !self
            .discipline_repository
            .exists_by_id(discipline_id, user_id)
            .await?
        {
            return Ok(CreateSessionMessage {
                message: Message {
                    code: false,
                    message: "Disciplina não encontrada".into(),
                },
                session_id: 0,
            });
        }

        if !self
            .content_repository
            .exists_by_id(discipline_id, content_id)
            .await?
        {
            return Ok(CreateSessionMessage {
                message: Message {
                    code: false,
                    message: "Conteúdo não encontrado".into(),
                },
                session_id: 0,
            });
        }

        let result = self
            .session_repository
            .create_session(user_id, discipline_id, content_id, session_type)
            .await?;

        Ok(CreateSessionMessage {
            message: Message {
                code: true,
                message: "Sessão criada com sucesso".into(),
            },
            session_id: result.last_insert_id,
        })
    }

    pub async fn update_session_review(
        &self,
        state: State<'_, DbStore>,
        session_id: i64,
        user_id: i64,
        update: UpdateReviewSession,
    ) -> Result<Message, AppError> {
        let mut tx = db_begin_tx(&state).await?;

        if !self.user_repository.exists_by_id(user_id).await? {
            return Ok(Message {
                code: true,
                message: "Usuário não encontrado".into(),
            });
        }
        let result = self
            .session_repository
            .update_session_tx(&mut tx, session_id, update)
            .await?;

        if result.rows_affected == 0 {
            return Ok(Message {
                code: false,
                message: "Sessão não encontrada ou nada para atualizar".into(),
            });
        }

        self.user_status_repository
            .update_streak_logic_tx(&mut tx, user_id)
            .await?;

        let discipline_id =self.session_repository
            .get_session(session_id).await?
            .map(|s| s.discipline_id)
            .unwrap();

        self.discipline_repository.recalculate_discipline_progress_tx(&mut tx, user_id, discipline_id).await?;

        db_commit_tx(tx).await?;

        Ok(Message {
            code: true,
            message: "Sessão atualizada com sucesso".into(),
        })
    }

    pub async fn get_all_session_review(&self, user_id: i64) -> Result<SessionDataAll, AppError> {
        if !self.user_repository.exists_by_id(user_id).await? {
            return Ok(SessionDataAll {
                message: Message {
                    code: false,
                    message: "Usuário não encontrado".into(),
                },
                sessions: None,
            });
        }

        let sessions = self
            .session_repository
            .get_all_user_sessions(user_id)
            .await?;

        Ok(SessionDataAll {
            message: Message {
                code: true,
                message: "Sessões recuperadas com sucesso".into(),
            },
            sessions: Some(sessions),
        })
    }

    pub async fn get_session_review(&self, session_id: i64) -> Result<SessionDataOne, AppError> {
        let session = self.session_repository.get_session(session_id).await?;

        Ok(SessionDataOne {
            message: Message {
                code: session.is_some(),
                message: if session.is_some() {
                    "Sessão recuperada com sucesso".into()
                } else {
                    "Sessão não encontrada".into()
                },
            },
            session,
        })
    }

    pub async fn save_item_review(
        &self,
        state: State<'_, DbStore>,
        input: ReviewLogInput,
    ) -> Result<Message, AppError> {
        let mut tx = db_begin_tx(&state).await?;

        if !self.user_repository.exists_by_id(input.user_id).await? {
            return Ok(Message {
                code: false,
                message: "Usuário não encontrado".into(),
            });
        }

        if !self
            .session_repository
            .exists_by_id(input.session_id)
            .await?
        {
            return Ok(Message {
                code: false,
                message: "Sessão não encontrada".into(),
            });
        }

        self
            .session_repository
            .save_item_review_tx(&mut tx, input)
            .await?;

        db_commit_tx(tx).await?;

        Ok(Message {
            code: true,
            message: "Item revisado com sucesso".into(),
        })
    }

    pub async fn save_item_review_question_obj(
        &self,
        state: State<'_, DbStore>,
        input: ReviewQuestionObjInput,
    ) -> Result<Message, AppError> {
        let mut tx = db_begin_tx(&state).await?;

        let question = self
            .question_repository
            .get_by_id(input.question_id).await?.ok_or(AppError::NotFound("Item de estudo não foi encontrado".into()))?;

        let objective = self
            .objective_answer_repository
            .get_correct_answer(input.option_id, question.id).await?.unwrap();

        let evolution_string = match objective.is_correct {
            1 => "CORRECT",
            _ => "WRONG"
        };

        let input_save = ReviewLogInput {
            session_id: input.session_id,
            user_id: input.user_id,
            study_item_id: question.study_item_id,
            item_type: input.item_type,
            evaluation: evolution_string.into(),
            time_spent: input.time_spent,
        };

        self.session_repository
            .save_item_review_tx(&mut tx, input_save)
            .await?;

        db_commit_tx(tx).await?;

        Ok(Message { 
            code: true, message: "Item revisado com sucesso".into()
        })
    }


    pub async fn cancel_session_review(
        &self,
        session_id: i64,
        user_id: i64,
    ) -> Result<Message, AppError> {
        if !self.user_repository.exists_by_id(user_id).await? {
            return Ok(Message {
                code: false,
                message: "Usuário não encontrado".into(),
            });
        }

        self.session_repository.delete(session_id).await?;

        Ok(Message {
            code: true,
            message: "Sessão cancelada com sucesso".into(),
        })
    }
}
