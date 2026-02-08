use crate::{
    error::app_error::AppError,
    model::content::UpdateContent,
    repository::{
        content_repository::ContentRepository, discipline_repository::DisciplineRepository,
    },
    service::dto::{content_response::ContentResponse, message_response::Message},
};

#[derive(serde::Serialize)]
pub struct ContentDataOne {
    pub message: Message,
    pub content: Option<ContentResponse>,
}

#[derive(serde::Serialize)]
pub struct ContentDataAll {
    pub message: Message,
    pub content: Option<Vec<ContentResponse>>,
}

pub struct ContentService<'a> {
    content_repository: ContentRepository<'a>,
    discipline_repository: DisciplineRepository<'a>,
}

impl<'a> ContentService<'a> {
    pub fn new(
        content_repository: ContentRepository<'a>,
        discipline_repository: DisciplineRepository<'a>,
    ) -> Self {
        Self {
            content_repository,
            discipline_repository,
        }
    }

    pub async fn create_content(
        &self,
        user_id: i64,
        discipline_id: i64,
        title: String,
        description: Option<String>,
        display_order: i64,
    ) -> Result<Message, AppError> {
        if title.is_empty() || display_order.is_negative() || display_order > 20 {
            return Ok(Message {
                code: false,
                message: "Campos incorretos ou não preenchidos".into(),
            });
        }

        if !self
            .discipline_repository
            .exists_by_id(discipline_id, user_id)
            .await?
        {
            return Ok(Message {
                code: false,
                message: "Disciplina não foi encontrada".into(),
            });
        }

        if self
            .content_repository
            .exists_by_title(discipline_id, title.clone())
            .await?
        {
            return Ok(Message {
                code: true,
                message: "Já existe um conteúdo com esse título".into(),
            });
        }

        self.content_repository
            .create_content(discipline_id, title, description, display_order)
            .await?;

        Ok(Message {
            code: true,
            message: "Conteúdo criado com sucesso".into(),
        })
    }

    pub async fn update_content(
        &self,
        user_id: i64,
        discipline_id: i64,
        content_id: i64,
        title: Option<String>,
        description: Option<String>,
        display_order: Option<i64>,
    ) -> Result<Message, AppError> {
        if !self
            .discipline_repository
            .exists_by_id(discipline_id, user_id)
            .await?
        {
            return Ok(Message {
                code: false,
                message: "Disciplina não foi encontrada".into(),
            });
        }

        if !self
            .content_repository
            .exists_by_id(discipline_id, content_id)
            .await?
        {
            return Ok(Message {
                code: false,
                message: "Conteúdo não foi encontrada".into(),
            });
        }

        let mut exists_title: bool = false;
        if let Some(title) = title.clone() {
            exists_title = self
                .content_repository
                .exists_by_title(discipline_id, title)
                .await?;
        }

        if exists_title {
            return Ok(Message {
                code: false,
                message: "Esse titulo já existe nessa disciplina, tente outro".into(),
            });
        }

        let update: UpdateContent = UpdateContent::new(title, description, display_order);
        self.content_repository
            .update_content(content_id, update)
            .await?;

        Ok(Message {
            code: true,
            message: "O conteúdo foi atualizada com sucesso.".into(),
        })
    }

    pub async fn delete_content(
        &self,
        user_id: i64,
        content_id: i64,
        discipline_id: i64,
    ) -> Result<Message, AppError> {
        if !self
            .discipline_repository
            .exists_by_id(discipline_id, user_id)
            .await?
        {
            return Ok(Message {
                code: false,
                message: "Disciplina não foi encontrada".into(),
            });
        }

        if !self
            .content_repository
            .exists_by_id(discipline_id, content_id)
            .await?
        {
            return Ok(Message {
                code: false,
                message: "Conteúdo não foi encontrada".into(),
            });
        }

        self.content_repository
            .delete_content(discipline_id, content_id)
            .await?;

        Ok(Message {
            code: true,
            message: "Exclusão efetuada com sucesso".into(),
        })
    }

    pub async fn get_all_content(
        &self,
        user_id: i64,
        discipline_id: i64,
    ) -> Result<ContentDataAll, AppError> {
        if !self
            .discipline_repository
            .exists_by_id(discipline_id, user_id)
            .await?
        {
            return Ok(ContentDataAll {
                message: Message {
                    code: true,
                    message: "Disciplina não foi encontrada".into(),
                },
                content: None,
            });
        }

        let result = self
            .content_repository
            .get_all_content(discipline_id)
            .await?;

        let contents: Vec<ContentResponse> = result.iter().map(|c| c.into()).collect();

        Ok(ContentDataAll {
            message: Message {
                code: true,
                message: "Buscas efetuadas com sucesso".into(),
            },
            content: Some(contents),
        })
    }

    pub async fn get_content(
        &self,
        user_id: i64,
        content_id: i64,
        discipline_id: i64,
    ) -> Result<ContentDataOne, AppError> {
        if !self
            .discipline_repository
            .exists_by_id(discipline_id, user_id)
            .await?
        {
            return Ok(ContentDataOne {
                message: Message {
                    code: false,
                    message: "Disciplina não foi encontrada".into(),
                },
                content: None,
            });
        }

        if !self
            .content_repository
            .exists_by_id(discipline_id, content_id)
            .await?
        {
            return Ok(ContentDataOne {
                message: Message {
                    code: false,
                    message: "Conteúdo não foi encontrada".into(),
                },
                content: None,
            });
        }

        self.content_repository
            .get_content(content_id, discipline_id)
            .await?;

        Ok(ContentDataOne {
            message: Message {
                code: true,
                message: "Buscas efetuadas com sucesso".into(),
            },
            content: None,
        })
    }
}
