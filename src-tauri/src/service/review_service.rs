use tauri::State;

use crate::{
    db::{
        config::DbStore,
        db_methods::{db_begin_tx, db_commit_tx},
    },
    error::app_error::AppError,
    model::session::{ReviewSession, UpdateReviewSession},
    repository::{
        content_repository::ContentRepository,
        discipline_repository::DisciplineRepository,
        session_repository::{ReviewLogInput, SessionRepository},
        user_repository::UserRepository,
        user_status_repository::UserStatusRepository,
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

pub struct ReviewService<'a> {
    session_repository: SessionRepository<'a>,
    user_repository: UserRepository<'a>,
    user_status_repository: UserStatusRepository<'a>,
    discipline_repository: DisciplineRepository<'a>,
    content_repository: ContentRepository<'a>,
}

impl<'a> ReviewService<'a> {
    pub fn new(
        session_repository: SessionRepository<'a>,
        user_repository: UserRepository<'a>,
        user_status_repository: UserStatusRepository<'a>,
        discipline_repository: DisciplineRepository<'a>,
        content_repository: ContentRepository<'a>,
    ) -> Self {
        Self {
            session_repository,
            user_repository,
            user_status_repository,
            discipline_repository,
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

        let result = self
            .session_repository
            .save_item_review_tx(&mut tx, input)
            .await?;

        self.discipline_repository
            .discipline_progress_update_tx(
                &mut tx,
                result.user_id,
                result.study_item_id,
                result.evaluation,
            )
            .await?;

        db_commit_tx(tx).await?;

        Ok(Message {
            code: true,
            message: "Item revisado com sucesso".into(),
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
