use chrono::{DateTime, Utc};

use crate::model::user::User;

#[derive(serde::Serialize)]
pub struct UserResponse {
    pub id: i64,
    pub username: String,
    pub email: String,
    pub avatar_path: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}


impl From<&User> for UserResponse {
    fn from(user: &User) -> Self {
        Self { 
            id: user.id, 
            username: user.username.clone(), 
            email: user.email.clone(), 
            avatar_path: user.avatar_path.clone(), 
            created_at: user.created_at, 
            updated_at: user.updated_at 
        }
    }
}