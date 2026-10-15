use sqlx::SqlitePool;
use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc,
};
use tokio::sync::{OwnedRwLockReadGuard, RwLock};

#[derive(Clone)]
pub struct DbStore {
    pub pool: SqlitePool,
    pub gate: Arc<RwLock<()>>,
    pub available: Arc<AtomicBool>,
}

impl DbStore {
    /// Held for the entire command, including its filesystem writes.
    pub async fn access(&self) -> Result<OwnedRwLockReadGuard<()>, String> {
        let guard = self.gate.clone().read_owned().await;
        if !self.available.load(Ordering::Acquire) {
            return Err(
                "O banco está protegido. Feche e reabra o aplicativo após a recuperação.".into(),
            );
        }
        Ok(guard)
    }
}
