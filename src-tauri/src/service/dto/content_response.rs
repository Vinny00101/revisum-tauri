use chrono::{DateTime, Utc};

use crate::model::content::Content;

#[derive(serde::Serialize)]
pub struct ContentResponse{
    pub id: i64,
    pub discipline_id: i64,
    pub title: String,
    pub description: Option<String>,
    pub display_order: i64,
    #[serde(serialize_with = "crate::utils::datetime::serialize")]
    pub created_at: DateTime<Utc>,
    #[serde(serialize_with = "crate::utils::datetime::serialize")]
    pub updated_at: DateTime<Utc>,
}

impl From<&Content> for ContentResponse {
    fn from(cont: &Content) -> Self {
        Self { 
            id: cont.id, 
            discipline_id: cont.discipline_id, 
            title: cont.title.clone(), 
            description: cont.description.clone(), 
            display_order: cont.display_order, 
            created_at: cont.created_at, 
            updated_at: cont.updated_at 
        }
    }
}
