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
#[derive(serde::Deserialize, Clone)] 
pub struct UpdateUserRes {
    pub username: Option<String>,
    pub email: Option<String>,
    pub password: Option<String>,
    pub avatar_bytes: Option<Vec<u8>>,
    pub avatar_extension: Option<String>,
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