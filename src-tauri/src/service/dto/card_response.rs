use chrono::{DateTime, Utc};

use crate::model::card::Card;

#[derive(serde::Serialize)]
pub struct CardResponse {
    pub id: i64,
    pub study_item_id: i64,
    pub front: String,
    pub back: String,
    #[serde(serialize_with = "crate::utils::datetime::serialize")]
    pub created_at: DateTime<Utc>,
    #[serde(serialize_with = "crate::utils::datetime::serialize")]
    pub updated_at: DateTime<Utc>,
}

impl From<&Card> for CardResponse {
    fn from(card: &Card) -> Self {
        Self {
            id: card.id,
            study_item_id: card.study_item_id,
            front: card.front.clone(),
            back: card.back.clone(),
            created_at: card.created_at,
            updated_at: card.updated_at,
        }
    }
}
