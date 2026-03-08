use chrono::{DateTime, Utc};

use crate::model::discipline::Discipline;
#[derive(serde::Serialize)]
pub struct DisciplineResponse {
    pub id: i64,
    pub user_id: i64,
    pub name: String,
    pub description: Option<String>,
    #[serde(serialize_with = "crate::utils::datetime::serialize")]
    pub created_at: DateTime<Utc>,
    #[serde(serialize_with = "crate::utils::datetime::serialize")]
    pub updated_at: DateTime<Utc>,
    pub total_items: i32,
    pub items_mastered: i32,
    pub progress_percent: f64,
    pub last_review_date: Option<String>,
}

impl From<&Discipline> for DisciplineResponse {
    fn from(disc: &Discipline) -> Self {
        Self {
            id: disc.id,
            user_id: disc.user_id, 
            name: disc.name.clone(), 
            description: disc.description.clone(), 
            created_at: disc.created_at, 
            updated_at: disc.updated_at,
            total_items: disc.total_items,
            items_mastered: disc.items_mastered,
            progress_percent: disc.progress_percent,
            last_review_date: disc.last_review_date.clone(),
        }
    }
}
