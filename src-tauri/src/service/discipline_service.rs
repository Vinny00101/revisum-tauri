use crate::{
    error::app_error::AppError,
    model::{
        discipline::{UpdateDiscipline}
    },
    repository::{
        discipline_repository::DisciplineRepository,
        user_repository::{UserRepository},
    },
    service::dto::{discipline_response::DisciplineResponse, message_response::Message},
};

#[derive(serde::Serialize)]
pub struct DisciplineDataOne {
    pub message: Message,
    pub discipline: Option<DisciplineResponse>,
}

pub struct DisciplineDataAll {
    pub message: Message,
    pub discipline: Option<Vec<DisciplineResponse>>,
}

pub struct DisciplineService<'a> {
    discipline_repository: DisciplineRepository<'a>,
    user_repository: UserRepository<'a>,
}

impl<'a> DisciplineService<'a> {
    pub fn new(
        discipline_repository: DisciplineRepository<'a>,
        user_repository: UserRepository<'a>,
    ) -> Self {
        Self {
            discipline_repository,
            user_repository,
        }
    }

    pub async fn create_discipline(
        &self,
        user_id: i64,
        name: String,
        description: Option<String>,
    ) -> Result<Message, AppError> {
        if name.is_empty() {
            return Ok(Message {
                code: false,
                message: "Campos não preenchidos.".into(),
            });
        }

        if !self.user_repository.exists_by_id(user_id).await? {
            return Ok(Message {
                code: false,
                message: "O usuário não foi encontrado".into(),
            });
        }

        if !self
            .discipline_repository
            .exists_name_discipline(user_id, name.clone())
            .await?
        {
            return Ok(Message {
                code: false,
                message: "O nome de disciplina já existe, tente um outro nome".into(),
            });
        }

        self.discipline_repository
            .create_discipline(user_id, name, description)
            .await?;

        Ok(Message {
            code: true,
            message: "Disciplina criada com sucesso.".into(),
        })
    }

    pub async fn update_discipline(
        &self,
        user_id: i64,
        discipline_id: i64,
        name: Option<String>,
        description: Option<String>,
    ) -> Result<Message, AppError> {
        if !self.user_repository.exists_by_id(user_id).await? {
            return Ok(Message {
                code: false,
                message: "O usuário não foi encontrado".into(),
            });
        }

        if !self
            .discipline_repository
            .exists_by_id(discipline_id, user_id)
            .await?
        {
            return Ok(Message {
                code: false,
                message: "Disciplina não encontrada".into(),
            });
        }

        let update = UpdateDiscipline::new(name, description);
        self.discipline_repository
            .update_discipline(user_id, discipline_id, update)
            .await?;

        Ok(Message {
            code: true,
            message: "A disciplina foi atualizada com sucesso.".into(),
        })
    }

    pub async fn delete_discipline(
        &self, 
        user_id: i64,
        discipline_id: i64,
    ) -> Result<Message, AppError> {
        if !self.user_repository.exists_by_id(user_id).await? {
            return Ok(Message { 
                code: false, 
                message: "O usuário não foi encontrado".into() 
            });
        }

        if !self
            .discipline_repository
            .exists_by_id(discipline_id, user_id)
            .await?
        {
            return Ok(Message {
                code: false,
                message: "Disciplina não encontrada".into(),
            });
        }

        self.discipline_repository.delete_discipline(user_id, discipline_id).await?;

        Ok(Message { 
            code: true, 
            message: "A disciplina foi deletada".into() 
        })
    }

    pub async fn get_all_discipline(&self, user_id: i64) -> Result<DisciplineDataAll, AppError> {
        if !self.user_repository.exists_by_id(user_id).await? {
            return Ok(DisciplineDataAll {
                message: Message {
                    code: false,
                    message: "O usuário não foi encontrado".into(),
                },
                discipline: None,
            });
        }

        let result = self
            .discipline_repository
            .get_all_discipline(user_id)
            .await?;

        let discipline: Vec<DisciplineResponse> = result.iter().map(|d| d.into()).collect();

        Ok(DisciplineDataAll {
            message: Message {
                code: true,
                message: "Buscas efetuadas com sucesso".into(),
            },
            discipline: Some(discipline),
        })
    }

    pub async fn get_discipline(
        &self,
        user_id: i64,
        discipline_id: i64,
    ) -> Result<DisciplineDataOne, AppError> {
        if !self.user_repository.exists_by_id(user_id).await? {
            return Ok(DisciplineDataOne {
                message: Message {
                    code: false,
                    message: "O usuário não foi encontrado".into(),
                },
                discipline: None,
            });
        }

        if !self
            .discipline_repository
            .exists_by_id(discipline_id, user_id)
            .await?
        {
            return Ok(DisciplineDataOne {
                message: Message {
                    code: false,
                    message: "Disciplina não encontrada".into(),
                },
                discipline: None,
            });
        }

        let result = self.discipline_repository
            .get_discipline(discipline_id, user_id).await?;
        if result.is_none() {
            return Ok(DisciplineDataOne {
                message: Message {
                    code: false,
                    message: "Disciplina não foi encontrada".into(),
                },
                discipline: None,
            });
        }

        let discipline = DisciplineResponse::from(&result.unwrap());

        Ok(DisciplineDataOne {
            message: Message {
                code: true,
                message: "Busca efetuada com sucesso".into(),
            },
            discipline: Some(discipline),
        })
    }
}
