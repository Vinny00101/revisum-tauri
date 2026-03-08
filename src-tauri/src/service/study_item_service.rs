use std::{fs, path::Path};

use tauri::State;
use uuid::Uuid;

use crate::{
    db::{
        config::DbStore,
        db_methods::{db_begin_tx, db_commit_tx, db_rollback_tx},
    }, error::app_error::AppError, filesystem::AppPaths, repository::{
        card_repository::CardRepository, content_repository::ContentRepository, discipline_repository::DisciplineRepository, discursive_response_repository::DiscursiveResponseRepository, objective_answer_repository::ObjectiveAnswerRepository, question_repository::QuestionRepository, studyi_item_repository::StudyItemRepository, user_repository::UserRepository
    }, service::dto::{
        card_response::CardResponse, content_response::ContentResponse, discipline_response::DisciplineResponse, discursive_response_response::DiscursiveResponseResponse, message_response::Message, objective_answer_response::ObjectiveAnswerResponse, question_response::QuestionResponse
    }
};
// response:

#[derive(serde::Serialize)]
pub struct QuestionFullResponse {
    pub question: QuestionResponse,
    pub objective_answers: Option<Vec<ObjectiveAnswerResponse>>,
    pub discursive_response: Option<DiscursiveResponseResponse>,
}

#[derive(serde::Serialize)]
pub struct StudyItemFullResponse {
    pub id: i64,
    pub content_id: i64,
    pub item_type: String,
    #[serde(serialize_with = "crate::utils::datetime::serialize")]
    pub created_at: chrono::DateTime<chrono::Utc>,
    #[serde(serialize_with = "crate::utils::datetime::serialize")]
    pub updated_at: chrono::DateTime<chrono::Utc>,

    pub card: Option<CardResponse>,
    pub question: Option<QuestionFullResponse>,
}

#[derive(serde::Serialize)]
pub struct StudyItemDataAll {
    pub message: Message,
    pub study_items: Option<Vec<StudyItemFullResponse>>,
}

#[derive(serde::Serialize)]
pub struct StudyItemDataOne {
    pub message: Message,
    pub study_item: Option<StudyItemFullResponse>,
}
#[derive(serde::Serialize)]
pub struct ReviewData {
    pub message: Message,
    pub content: Option<ContentResponse>,
    pub discipline: Option<DisciplineResponse>,
    pub study_items: Option<Vec<StudyItemFullResponse>>,
}

// inputs e types

#[derive(serde::Deserialize)]
pub enum StudyItemType {
    CARD,
    QUESTION,
}

#[derive(serde::Deserialize)]
pub enum QuestionType {
    OBJECTIVE,
    DISCURSIVE,
}

#[derive(serde::Deserialize)]
pub struct CreateCardInput {
    pub front: String,
    pub back: String,
}

#[derive(serde::Deserialize)]
pub struct CreateObjectiveAnswerInput {
    pub text: String,
    pub image: Option<String>,
    pub is_correct: i64,
}

#[derive(serde::Deserialize)]
pub struct CreateQuestionInput {
    pub question_type: QuestionType,
    pub statement_text: String,
    pub question_img_bytes: Option<Vec<u8>>,
    pub question_img_extension: Option<String>,
    pub objective_answers: Option<Vec<CreateObjectiveAnswerInput>>,
    pub expected_answer: Option<String>,
    pub evaluation_criteria: Option<String>,
}

#[derive(serde::Deserialize)]
pub struct CreateStudyItemInput {
    pub content_id: i64,
    pub item_type: StudyItemType,
    pub card: Option<CreateCardInput>,
    pub question: Option<CreateQuestionInput>,
}

pub struct StudyItemService<'a> {
    study_item_repository: StudyItemRepository<'a>,
    card_repository: CardRepository<'a>,
    question_repository: QuestionRepository<'a>,
    objective_answer_repository: ObjectiveAnswerRepository<'a>,
    discursive_response_repository: DiscursiveResponseRepository<'a>,
    user_repository: UserRepository<'a>,
    discipline_repository: DisciplineRepository<'a>,
    content_repository: ContentRepository<'a>,
}

impl<'a> StudyItemService<'a> {
    pub fn new(
        study_item_repository: StudyItemRepository<'a>,
        card_repository: CardRepository<'a>,
        question_repository: QuestionRepository<'a>,
        objective_answer_repository: ObjectiveAnswerRepository<'a>,
        discursive_response_repository: DiscursiveResponseRepository<'a>,
        user_repository: UserRepository<'a>,
        discipline_repository: DisciplineRepository<'a>,
        content_repository: ContentRepository<'a>,
    ) -> Self {
        Self {
            study_item_repository,
            card_repository,
            question_repository,
            objective_answer_repository,
            discursive_response_repository,
            user_repository,
            discipline_repository,
            content_repository,
        }
    }

    async fn save_question(
        &self,
        paths: &AppPaths,
        bytes: Vec<u8>,
        extension: String,
        old_question_path: Option<String>,
    ) -> Result<String, AppError> {
        if !paths.questions.exists() {
            fs::create_dir_all(&paths.questions)
                .map_err(|e| AppError::Internal(format!("Erro ao criar pasta: {}", e)))?;
        }

        let file_name = format!("{}.{}", Uuid::new_v4(), extension);
        let file_path = paths.questions.join(&file_name);

        fs::write(&file_path, bytes)
            .map_err(|e| AppError::Internal(format!("Erro ao salvar imagem: {}", e)))?;

        if let Some(path_str) = old_question_path {
            let old_path = Path::new(&path_str);
            if old_path.exists() {
                let _ = fs::remove_file(old_path);
            }
        }

        Ok(file_path.to_string_lossy().into_owned())
    }

    pub async fn create_study_item_tx(
        &self,
        state: State<'_, DbStore>,
        paths: &AppPaths,
        user_id: i64,
        input: CreateStudyItemInput,
    ) -> Result<Message, AppError> {
        // valida usuário
        if !self.user_repository.exists_by_id(user_id).await? {
            return Ok(Message {
                code: false,
                message: "Usuário não encontrado".into(),
            });
        }

        // valida conteúdo
        if !self
            .content_repository
            .exists_by_id_user(input.content_id, user_id)
            .await?
        {
            return Ok(Message {
                code: false,
                message: "Conteúdo não encontrado".into(),
            });
        }

        // BEGIN TRANSACTION
        let mut tx = db_begin_tx(&state).await?;

        // tudo a partir daqui é protegido
        let result: Result<(), AppError> = async {
            // cria study_item
            let study_item_id = self
                .study_item_repository
                .create_study_item_tx(
                    &mut tx,
                    input.content_id,
                    match input.item_type {
                        StudyItemType::CARD => "CARD",
                        StudyItemType::QUESTION => "QUESTION",
                    }
                    .to_string(),
                )
                .await?
                .last_insert_id;

            match input.item_type {
                StudyItemType::CARD => {
                    let card = input.card.ok_or(AppError::InvalidInput(
                        "Dados do card não informados".into(),
                    ))?;

                    if card.front.is_empty() || card.back.is_empty() {
                        return Err(AppError::InvalidInput(
                            "Campos do card não preenchidos".into(),
                        ));
                    }

                    self.card_repository
                        .create_card_tx(&mut tx, study_item_id, card.front, card.back)
                        .await?;
                }

                StudyItemType::QUESTION => {
                    let question = input.question.ok_or(AppError::InvalidInput(
                        "Dados da questão não informados".into(),
                    ))?;

                    let mut avatar_path_to_save: Option<String> = None;
                    if let (Some(bytes), Some(ext)) =
                        (question.question_img_bytes.clone(), question.question_img_extension.clone())
                    {
                        let path = self
                            .save_question(paths, bytes, ext, None)
                            .await?;
                        avatar_path_to_save = Some(path);
                    }

                    let question_id = self
                        .question_repository
                        .create_question_tx(
                            &mut tx,
                            study_item_id,
                            match question.question_type {
                                QuestionType::OBJECTIVE => "OBJECTIVE",
                                QuestionType::DISCURSIVE => "DISCURSIVE",
                            }
                            .to_string(),
                            question.statement_text,
                            avatar_path_to_save,
                        )
                        .await?
                        .last_insert_id;

                    match question.question_type {
                        QuestionType::OBJECTIVE => {
                            let answers = question.objective_answers.ok_or(
                                AppError::InvalidInput("Respostas objetivas não informadas".into()),
                            )?;

                            for ans in answers {
                                self.objective_answer_repository
                                    .create_objective_answer_tx(
                                        &mut tx,
                                        question_id,
                                        ans.text,
                                        ans.image,
                                        ans.is_correct,
                                    )
                                    .await?;
                            }
                        }

                        QuestionType::DISCURSIVE => {
                            let expected = question.expected_answer.ok_or(
                                AppError::InvalidInput("Resposta esperada não informada".into()),
                            )?;

                            self.discursive_response_repository
                                .create_discursive_response_tx(
                                    &mut tx,
                                    question_id,
                                    expected,
                                    question.evaluation_criteria,
                                )
                                .await?;
                        }
                    }
                }
            }

            Ok(())
        }
        .await;

        // FINALIZA TRANSACTION
        match result {
            Ok(_) => {
                db_commit_tx(tx).await?;
                Ok(Message {
                    code: true,
                    message: "Item de estudo criado com sucesso".into(),
                })
            }
            Err(e) => {
                db_rollback_tx(tx).await?;
                Err(e)
            }
        }
    }

    pub async fn get_all_study_item_by_content(
        &self,
        user_id: i64,
        content_id: i64,
    ) -> Result<StudyItemDataAll, AppError> {
        if !self.user_repository.exists_by_id(user_id).await? {
            return Ok(StudyItemDataAll {
                message: Message {
                    code: false,
                    message: "Usuário não encontrado".into(),
                },
                study_items: None,
            });
        }

        if !self
            .content_repository
            .exists_by_id_user(content_id, user_id)
            .await?
        {
            return Ok(StudyItemDataAll {
                message: Message {
                    code: false,
                    message: "Conteúdo não encontrado".into(),
                },
                study_items: None,
            });
        }

        let study_items = self
            .study_item_repository
            .get_by_content(content_id)
            .await?;

        let mut response: Vec<StudyItemFullResponse> = Vec::new();

        for item in study_items {
            match item.item_type.as_str() {
                "CARD" => {
                    let card = self
                        .card_repository
                        .get_by_study_item(item.id)
                        .await?
                        .map(|c| CardResponse::from(&c));

                    response.push(StudyItemFullResponse {
                        id: item.id,
                        content_id: item.content_id,
                        item_type: item.item_type.clone(),
                        created_at: item.created_at,
                        updated_at: item.updated_at,
                        card,
                        question: None,
                    });
                }

                "QUESTION" => {
                    let question = self.question_repository.get_by_study_item(item.id).await?;

                    if let Some(q) = question {
                        let q_response: QuestionResponse = QuestionResponse::from(&q);

                        let objective_answers = self
                            .objective_answer_repository
                            .get_by_question(q.id)
                            .await?;

                        let objective_answers = if objective_answers.is_empty() {
                            None
                        } else {
                            Some(
                                objective_answers
                                    .iter()
                                    .map(|a| ObjectiveAnswerResponse::from(a))
                                    .collect::<Vec<_>>(),
                            )
                        };

                        let discursive_response = self
                            .discursive_response_repository
                            .get_by_question(q.id)
                            .await?
                            .map(|d| DiscursiveResponseResponse::from(&d));

                        response.push(StudyItemFullResponse {
                            id: item.id,
                            content_id: item.content_id,
                            item_type: item.item_type.clone(),
                            created_at: item.created_at,
                            updated_at: item.updated_at,
                            card: None,
                            question: Some(QuestionFullResponse {
                                question: q_response,
                                objective_answers,
                                discursive_response,
                            }),
                        });
                    }
                }

                _ => {
                    return Ok(StudyItemDataAll {
                        message: Message {
                            code: false,
                            message: "Tipo de item inválido".into(),
                        },
                        study_items: None,
                    });
                }
            }
        }

        Ok(StudyItemDataAll {
            message: Message {
                code: true,
                message: "Itens carregados com sucesso".into(),
            },
            study_items: Some(response),
        })
    }

    pub async fn get_study_item_by_content(
        &self,
        study_item_id: i64,
        user_id: i64,
        content_id: i64,
    ) -> Result<StudyItemDataOne, AppError> {
        if !self.user_repository.exists_by_id(user_id).await? {
            return Ok(StudyItemDataOne {
                message: Message {
                    code: false,
                    message: "Usuário não encontrado".into(),
                },
                study_item: None,
            });
        }

        if !self
            .content_repository
            .exists_by_id_user(content_id, user_id)
            .await?
        {
            return Ok(StudyItemDataOne {
                message: Message {
                    code: false,
                    message: "Conteúdo não encontrado".into(),
                },
                study_item: None,
            });
        }

        let study_item = self.study_item_repository.get_by_id(study_item_id).await?;
        let result = match study_item {
            Some(item) => item,
            None => {
                return Ok(StudyItemDataOne {
                    message: Message {
                        code: false,
                        message: "Item não foi encontrado".into(),
                    },
                    study_item: None,
                });
            }
        };

        let response: StudyItemFullResponse = match result.item_type.as_str() {
            "CARD" => {
                let card = self
                    .card_repository
                    .get_by_study_item(result.id)
                    .await?
                    .map(|c| CardResponse::from(&c));

                StudyItemFullResponse {
                    id: result.id,
                    content_id: result.content_id,
                    item_type: result.item_type.clone(),
                    created_at: result.created_at,
                    updated_at: result.updated_at,
                    card,
                    question: None,
                }
            }
            "QUESTION" => {
                let question = self
                    .question_repository
                    .get_by_study_item(result.id)
                    .await?
                    .map(|q| QuestionResponse::from(&q));

                let q = match question {
                    Some(q) => q,
                    None => {
                        return Ok(StudyItemDataOne {
                            message: Message {
                                code: false,
                                message: "Questão não encontrada".into(),
                            },
                            study_item: None,
                        });
                    }
                };

                let objective_answers = self
                    .objective_answer_repository
                    .get_by_question(q.id)
                    .await?;

                let objective_answers = if objective_answers.is_empty() {
                    None
                } else {
                    Some(
                        objective_answers
                            .iter()
                            .map(|a| ObjectiveAnswerResponse::from(a))
                            .collect::<Vec<_>>(),
                    )
                };

                let discursive_response = self
                    .discursive_response_repository
                    .get_by_question(q.id)
                    .await?
                    .map(|d| DiscursiveResponseResponse::from(&d));

                StudyItemFullResponse {
                    id: result.id,
                    content_id: result.content_id,
                    item_type: result.item_type.clone(),
                    created_at: result.created_at,
                    updated_at: result.updated_at,
                    card: None,
                    question: Some(QuestionFullResponse {
                        question: q,
                        objective_answers,
                        discursive_response,
                    }),
                }
            }
            _ => {
                return Ok(StudyItemDataOne {
                    message: Message {
                        code: false,
                        message: "Tipo de item inválido".into(),
                    },
                    study_item: None,
                });
            }
        };

        Ok(StudyItemDataOne {
            message: Message {
                code: true,
                message: "Itens carregados com sucesso".into(),
            },
            study_item: Some(response),
        })
    }

    pub async fn delete_study_item_by_content(
        &self,
        state: State<'_, DbStore>,
        study_item_id: i64,
        user_id: i64,
        content_id: i64,
    ) -> Result<Message, AppError> {
        if !self.user_repository.exists_by_id(user_id).await? {
            return Ok(Message {
                code: false,
                message: "Usuário não encontrado".into(),
            });
        }

        if !self
            .content_repository
            .exists_by_id_user(content_id, user_id)
            .await?
        {
            return Ok(Message {
                code: false,
                message: "Conteúdo não encontrado".into(),
            });
        }

        let mut tx = db_begin_tx(&state).await?;

        self.study_item_repository
            .delete_tx(&mut tx, study_item_id, content_id)
            .await?;

        tx.commit().await?;

        Ok(Message {
            code: true,
            message: "Item de estudo deletado com sucesso".into(),
        })
    }

    pub async fn get_review_data(
        &self,
        user_id: i64,
        content_id: i64,
    ) -> Result<ReviewData, AppError> {
        if !self.user_repository.exists_by_id(user_id).await? {
            return Ok(ReviewData {
                message: Message {
                    code: false,
                    message: "Usuário não encontrado".into(),
                },
                content: None,
                discipline: None,
                study_items: None,            
            });
        }

        if !self.content_repository.exists_by_id_user(content_id, user_id).await? {
            return Ok(ReviewData {
                message: Message {
                    code: false,
                    message: "Conteúdo não encontrado".into(),
                },
                content: None,
                discipline: None,
                study_items: None,            
            });
        }

        let content = self.content_repository.get_content_by_id(content_id).await?.map(|c| ContentResponse::from(&c));
        let content = match content {
            Some(c) => c,
            None => {
                return Ok(ReviewData {
                    message: Message {
                        code: false,
                        message: "Conteúdo não encontrado".into(),
                    },
                    content: None,
                    discipline: None,
                    study_items: None,            
                })
            }
        };

        let discipline = self.discipline_repository.get_discipline(content.discipline_id, user_id).await?.map(|d| DisciplineResponse::from(&d));
        let discipline = match discipline {
            Some(d) => d,
            None => {
                return Ok(ReviewData {
                    message: Message {
                        code: false,
                        message: "Disciplina não encontrada".into(),
                    },
                    content: None,
                    discipline: None,
                    study_items: None,            
                })
            }
        };

        let study_items = self
            .study_item_repository
            .get_by_content(content_id)
            .await?;

        let mut response: Vec<StudyItemFullResponse> = Vec::new();

        for item in study_items {
            match item.item_type.as_str() {
                "CARD" => {
                    let card = self
                        .card_repository
                        .get_by_study_item(item.id)
                        .await?
                        .map(|c| CardResponse::from(&c));

                    response.push(StudyItemFullResponse {
                        id: item.id,
                        content_id: item.content_id,
                        item_type: item.item_type.clone(),
                        created_at: item.created_at,
                        updated_at: item.updated_at,
                        card,
                        question: None,
                    });
                }

                "QUESTION" => {
                    let question = self.question_repository.get_by_study_item(item.id).await?;

                    if let Some(q) = question {
                        let q_response: QuestionResponse = QuestionResponse::from(&q);

                        let objective_answers = self
                            .objective_answer_repository
                            .get_by_question(q.id)
                            .await?;

                        let objective_answers = if objective_answers.is_empty() {
                            None
                        } else {
                            Some(
                                objective_answers
                                    .iter()
                                    .map(|a| ObjectiveAnswerResponse::from(a))
                                    .collect::<Vec<_>>(),
                            )
                        };

                        let discursive_response = self
                            .discursive_response_repository
                            .get_by_question(q.id)
                            .await?
                            .map(|d| DiscursiveResponseResponse::from(&d));

                        response.push(StudyItemFullResponse {
                            id: item.id,
                            content_id: item.content_id,
                            item_type: item.item_type.clone(),
                            created_at: item.created_at,
                            updated_at: item.updated_at,
                            card: None,
                            question: Some(QuestionFullResponse {
                                question: q_response,
                                objective_answers,
                                discursive_response,
                            }),
                        });
                    }
                }

                _ => {
                    return Ok(ReviewData {
                        message: Message {
                            code: false,
                            message: "Tipo de item inválido".into(),
                        },
                        content: None,
                        discipline: None,
                        study_items: None,            
                    });
                }
            }
        }

        Ok(ReviewData { 
            message: Message { code: true, message: "Busca efetuada com sucesso".into() }, 
            content: Some(content), 
            discipline: Some(discipline), 
            study_items: Some(response) 
        })
    }

}
