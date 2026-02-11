use chrono::{DateTime, Utc};

use crate::model::studyitem::StudyItem;

#[derive(serde::Serialize)]
pub struct StudyItemResponse {
    pub id: i64,
    pub content_id: i64,
    pub item_type: String,
    #[serde(serialize_with = "crate::utils::datetime::serialize")]
    pub created_at: DateTime<Utc>,
    #[serde(serialize_with = "crate::utils::datetime::serialize")]
    pub updated_at: DateTime<Utc>,
}

impl From<&StudyItem> for StudyItemResponse {
    fn from(item: &StudyItem) -> Self {
        Self {
            id: item.id,
            content_id: item.content_id,
            item_type: item.item_type.clone(),
            created_at: item.created_at,
            updated_at: item.updated_at,
        }
    }
}