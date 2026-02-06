use tauri::State;

use crate::{db::config::DbStore, model::content::Content, repository::base_repository::{EntityRepository, QueryRepository, MutationRepository}};


pub(crate) struct ContentRepository<'a>{
    state: State<'a, DbStore>,
} 

impl<'a> ContentRepository<'a> {

}

impl<'a> MutationRepository for ContentRepository<'a> {
    fn get_state(&self) ->  &State<'_,DbStore> {
        &self.state
    }
}

impl<'a> QueryRepository for  ContentRepository<'a> {
    fn get_state(&self) ->  &State<'_,DbStore> {
        &self.state
    }
}

impl<'a> EntityRepository<Content> for ContentRepository<'a> {
    fn get_state(&self) ->  &State<'_,DbStore> {
        &self.state
    }
}