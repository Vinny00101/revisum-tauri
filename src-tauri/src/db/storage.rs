use super::{
    backup::{self, BackupManifest},
    config::DbStore,
    preflight::{self, SafetyResult},
    recovery,
};
use serde::Serialize;
use sqlx::{
    sqlite::{SqliteJournalMode, SqlitePoolOptions, SqliteSynchronous},
    Connection, SqliteConnection,
};
use std::{
    fs::{self, File, OpenOptions},
    path::PathBuf,
    sync::{
        atomic::{AtomicBool, Ordering},
        Arc, Mutex,
    },
};
use tokio::sync::RwLock;

#[derive(Clone, Serialize)]
pub struct StorageStatus {
    pub state: String,
    pub message: String,
    pub data_directory: String,
    pub app_version: String,
    pub schema_version: Option<usize>,
    pub automatic_backup: Option<String>,
}

pub struct StorageManager {
    root: PathBuf,
    // Keep the same lock file and handle for the entire process lifetime.
    _process_lock: Option<File>,
    pub gate: Arc<RwLock<()>>,
    available: Arc<AtomicBool>,
    status: Mutex<StorageStatus>,
    pool: Option<sqlx::SqlitePool>,
}

impl StorageManager {
    pub async fn initialize(root: PathBuf) -> (Self, Option<DbStore>) {
        let mut manager = Self {
            status: Mutex::new(StorageStatus {
                state: "recovery_required".into(),
                message: String::new(),
                data_directory: root.to_string_lossy().into_owned(),
                app_version: env!("CARGO_PKG_VERSION").into(),
                schema_version: None,
                automatic_backup: None,
            }),
            root,
            _process_lock: None,
            gate: Arc::new(RwLock::new(())),
            available: Arc::new(AtomicBool::new(false)),
            pool: None,
        };
        match manager.bootstrap().await {
            Ok((pool, version)) => {
                manager.available.store(true, Ordering::Release);
                manager.pool = Some(pool.clone());
                let mut status = manager.status.lock().unwrap_or_else(|e| e.into_inner());
                status.state = "ready".into();
                status.schema_version = Some(version);
                drop(status);
                let store = DbStore {
                    pool,
                    gate: manager.gate.clone(),
                    available: manager.available.clone(),
                };
                (manager, Some(store))
            }
            Err(error) => {
                manager.set_state("recovery_required", &error);
                (manager, None)
            }
        }
    }

    async fn bootstrap(&mut self) -> SafetyResult<(sqlx::SqlitePool, usize)> {
        fs::create_dir_all(&self.root)
            .map_err(|e| format!("Não foi possível acessar a pasta de dados: {e}"))?;
        backup::reject_link(&self.root)?;
        let lock_path = self.root.join("revisum.lock");
        if lock_path.try_exists().map_err(|e| e.to_string())? {
            backup::reject_link(&lock_path)?;
        }
        let process_lock = OpenOptions::new()
            .create(true)
            .truncate(false)
            .read(true)
            .write(true)
            .open(lock_path)
            .map_err(|e| e.to_string())?;
        process_lock.try_lock().map_err(|_| {
            "Outra instância do Revisum está usando esta pasta. Feche-a antes de continuar."
                .to_string()
        })?;
        self._process_lock = Some(process_lock);
        if recovery::rollback_interrupted(&self.root)? {
            self.set_state("recovery_required", "Uma restauração interrompida foi revertida. Os arquivos anteriores foram preservados.");
        }
        let path = self.root.join("revisum.db");
        let exists = path
            .try_exists()
            .map_err(|e| format!("Não foi possível verificar o banco: {e}"))?;
        if exists {
            backup::reject_link(&path)?;
            if !path.is_file() {
                return Err(
                    "O caminho do banco não é um arquivo. Nenhum dado foi substituído.".into(),
                );
            }
        } else {
            for sidecar in ["revisum.db-wal", "revisum.db-shm"] {
                if self
                    .root
                    .join(sidecar)
                    .try_exists()
                    .map_err(|e| e.to_string())?
                {
                    return Err("O banco principal está ausente, mas seus arquivos auxiliares existem. Recupere os dados antes de continuar.".into());
                }
            }
            File::create_new(&path)
                .map_err(|e| e.to_string())?
                .sync_all()
                .map_err(|e| e.to_string())?;
        }
        for sidecar in ["revisum.db-wal", "revisum.db-shm"] {
            let sidecar = self.root.join(sidecar);
            if sidecar.try_exists().map_err(|e| e.to_string())? {
                backup::reject_link(&sidecar)?;
            }
        }
        let inspection = {
            let mut readonly = preflight::open_readonly(&path).await?;
            let inspected = async {
                let inspection = preflight::inspect(&mut readonly).await?;
                if exists && inspection.needs_changes() {
                    let manifest =
                        backup::create_backup(&self.root, &mut readonly, "before-migration")
                            .await?;
                    backup::verify_backup(&self.root, &manifest.id).await?;
                    self.status
                        .lock()
                        .unwrap_or_else(|e| e.into_inner())
                        .automatic_backup = Some(manifest.id);
                }
                Ok::<_, String>(inspection)
            }
            .await;
            let closed = readonly.close().await.map_err(|e| e.to_string());
            let inspection = inspected?;
            closed?;
            inspection
        };
        let mut connection = SqliteConnection::connect_with(&preflight::options(&path, false))
            .await
            .map_err(|e| e.to_string())?;
        let migrated = async {
            if inspection.adopt_baseline || !inspection.checksum_changes.is_empty() {
                let id = self
                    .status()
                    .automatic_backup
                    .ok_or("A compatibilidade exige um backup verificado.")?;
                preflight::apply_compatibility(&mut connection, &inspection, &id).await?;
            }
            preflight::migrator()
                .await?
                .run(&mut connection)
                .await
                .map_err(|e| format!("Migration não concluída. Os dados foram preservados: {e}"))?;
            let ready = preflight::inspect(&mut connection).await?;
            if ready.needs_changes() {
                return Err("A atualização do banco não foi concluída.".into());
            }
            Ok::<_, String>(ready)
        }
        .await;
        let closed = connection.close().await.map_err(|e| e.to_string());
        let ready = migrated?;
        closed?;
        for relative in [
            "images",
            "images/user",
            "images/user/avatar",
            "images/question",
        ] {
            backup::ensure_directory(&self.root.join(relative))?;
        }
        let pool = SqlitePoolOptions::new()
            .max_connections(5)
            .connect_with(
                preflight::options(&path, false)
                    .journal_mode(SqliteJournalMode::Wal)
                    .synchronous(SqliteSynchronous::Full),
            )
            .await
            .map_err(|e| e.to_string())?;
        Ok((pool, ready.version))
    }

    pub fn status(&self) -> StorageStatus {
        self.status
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .clone()
    }

    fn set_state(&self, state: &str, message: &str) {
        let mut status = self.status.lock().unwrap_or_else(|e| e.into_inner());
        status.state = state.into();
        status.message = message.into();
    }

    pub fn list_backups(&self) -> SafetyResult<Vec<BackupManifest>> {
        backup::list_backups(&self.root)
    }

    pub async fn create_backup(&self) -> SafetyResult<BackupManifest> {
        let _maintenance = self.gate.write().await;
        if !self.available.load(Ordering::Acquire) || self._process_lock.is_none() {
            return Err(
                "O banco não está disponível para criar um backup. O original foi preservado."
                    .into(),
            );
        }
        let mut conn = preflight::open_readonly(&self.root.join("revisum.db")).await?;
        let copied = backup::create_backup(&self.root, &mut conn, "manual").await;
        let closed = conn.close().await.map_err(|e| e.to_string());
        let manifest = copied?;
        closed?;
        backup::verify_backup(&self.root, &manifest.id).await?;
        Ok(manifest)
    }

    pub async fn restore_backup(&self, id: &str) -> SafetyResult<()> {
        let _maintenance = self.gate.write().await;
        if self._process_lock.is_none() {
            return Err("Feche a outra instância do Revisum antes de restaurar.".into());
        }
        let manifest = backup::verify_backup(&self.root, id).await?;
        if manifest.source_directory != fs::canonicalize(&self.root).map_err(|e| e.to_string())? {
            return Err("O backup pertence a outra pasta de dados; é necessária uma conversão dos caminhos antes da restauração.".into());
        }
        if self.available.load(Ordering::Acquire) {
            let mut conn = preflight::open_readonly(&self.root.join("revisum.db")).await?;
            let copied = backup::create_backup(&self.root, &mut conn, "before-restore").await;
            let closed = conn.close().await.map_err(|e| e.to_string());
            let fallback = copied?;
            closed?;
            backup::verify_backup(&self.root, &fallback.id).await?;
        }
        self.available.store(false, Ordering::Release);
        self.set_state(
            "restart_required",
            "Feche e reabra o Revisum para concluir a recuperação.",
        );
        if let Some(pool) = &self.pool {
            pool.close().await;
        }
        let result = recovery::restore(&self.root, id).await;
        match &result {
            Ok(()) => self.set_state(
                "restart_required",
                "Backup restaurado. Feche e reabra o Revisum para verificar e abrir seus estudos.",
            ),
            Err(error) => self.set_state(
                "recovery_required",
                &format!("{error} Feche e reabra o Revisum antes de tentar novamente."),
            ),
        }
        result
    }
}
