use chrono::{DateTime, Utc};

use crate::model::discipline::Discipline;

#[derive(serde::Serialize)]
pub struct DisciplineResponse{
    pub id: i64,
    pub user_id: i64,
    pub name: String,
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<&Discipline> for DisciplineResponse {
    fn from(disc: &Discipline) -> Self {
        Self { 
            id: disc.id,
            user_id: disc.user_id, 
            name: disc.name.clone(), 
            description: disc.description.clone(), 
            created_at: disc.created_at, 
            updated_at: disc.updated_at 
        }
    }
}
