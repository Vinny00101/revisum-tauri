//! A durable restore intent makes replacement recoverable after interruption.
//! Originals are moved aside, never deleted. Remaining intents are rolled back
//! at startup before any database is opened for writing.
use super::{
    backup,
    preflight::{self, SafetyResult},
};
use serde::{Deserialize, Serialize};
use sqlx::Connection;
use std::{fs, path::Path};
use uuid::Uuid;

const INTENT: &str = "restore-intent.json";
const ITEMS: [&str; 4] = ["revisum.db", "revisum.db-wal", "revisum.db-shm", "images"];

#[derive(Serialize, Deserialize)]
struct RestoreIntent {
    id: String,
}

pub fn rollback_interrupted(app_dir: &Path) -> SafetyResult<bool> {
    let marker = app_dir.join(INTENT);
    if !marker.try_exists().map_err(|e| e.to_string())? {
        return Ok(false);
    }
    backup::reject_link(&marker)?;
    if fs::metadata(&marker).map_err(|e| e.to_string())?.len() > 1024 {
        return Err("Registro de restauração inválido; os dados foram preservados.".into());
    }
    let intent: RestoreIntent =
        serde_json::from_slice(&fs::read(&marker).map_err(|e| e.to_string())?)
            .map_err(|e| e.to_string())?;
    if Uuid::parse_str(&intent.id)
        .map_err(|e| e.to_string())?
        .to_string()
        != intent.id
    {
        return Err("Registro de restauração inválido.".into());
    }
    let recovery = app_dir.join("recovery");
    backup::reject_link(&recovery)?;
    let transaction = recovery.join(intent.id);
    backup::reject_link(&transaction)?;
    let candidate = transaction.join("candidate");
    let previous = transaction.join("previous");
    backup::reject_link(&candidate)?;
    backup::reject_link(&previous)?;
    let failed = transaction.join("rolled-back");
    backup::ensure_directory(&failed)?;
    let replacement_was_installed = !candidate
        .join("revisum.db")
        .try_exists()
        .map_err(|e| e.to_string())?;
    // Recover sidecars before the DB. Its absent staging file remains durable
    // evidence that replacement sidecars must be discarded until they are done.
    for name in ["revisum.db-wal", "revisum.db-shm", "images", "revisum.db"] {
        let original = previous.join(name);
        let active = app_dir.join(name);
        let staged = candidate.join(name);
        let original_exists = original.try_exists().map_err(|e| e.to_string())?;
        let installed = (name == "revisum.db" || name == "images" || replacement_was_installed)
            && !staged.try_exists().map_err(|e| e.to_string())?;
        if installed && active.try_exists().map_err(|e| e.to_string())? {
            backup::reject_link(&active)?;
            // Putting the replacement back in staging also durably records that
            // this item was rolled back, so retrying cannot move the original.
            fs::rename(&active, &staged).map_err(|e| {
                format!("Não foi possível preservar a restauração interrompida: {e}")
            })?;
        } else if original_exists && active.try_exists().map_err(|e| e.to_string())? {
            backup::reject_link(&active)?;
            fs::rename(&active, failed.join(format!("{}-{name}", Uuid::new_v4())))
                .map_err(|e| e.to_string())?;
        }
        if original_exists {
            if installed && !staged.try_exists().map_err(|e| e.to_string())? {
                if name == "images" {
                    fs::create_dir(&staged).map_err(|e| e.to_string())?;
                } else {
                    fs::File::create_new(&staged)
                        .and_then(|f| f.sync_all())
                        .map_err(|e| e.to_string())?;
                }
            }
            backup::reject_link(&original)?;
            fs::rename(original, active)
                .map_err(|e| format!("Não foi possível recuperar os arquivos anteriores: {e}"))?;
        }
    }
    fs::remove_file(marker).map_err(|e| e.to_string())?;
    Ok(true)
}

/// Caller closes its pool and holds exclusive maintenance access.
pub async fn restore(app_dir: &Path, backup_id: &str) -> SafetyResult<()> {
    if app_dir
        .join(INTENT)
        .try_exists()
        .map_err(|e| e.to_string())?
    {
        return Err("Há uma restauração interrompida. Feche e reabra o Revisum para recuperar os arquivos anteriores.".into());
    }
    let manifest = backup::verify_backup(app_dir, backup_id).await?;
    if manifest.source_directory != fs::canonicalize(app_dir).map_err(|e| e.to_string())? {
        return Err("Este backup foi criado em outra pasta de dados. A restauração portátil exige conversão dos caminhos das imagens e não será aplicada automaticamente.".into());
    }
    let root = app_dir.join("recovery");
    backup::ensure_directory(&root)?;
    let id = Uuid::new_v4().to_string();
    let transaction = root.join(&id);
    backup::ensure_directory(&transaction)?;
    let candidate = transaction.join("candidate");
    let original = transaction.join("previous");
    backup::ensure_directory(&original)?;
    let source = app_dir.to_path_buf();
    let selected = backup_id.to_string();
    let target = candidate.clone();
    tokio::task::spawn_blocking(move || backup::stage_payload(&source, &selected, &target))
        .await
        .map_err(|e| e.to_string())??;
    let mut staged_db = preflight::open_readonly(&candidate.join("revisum.db")).await?;
    preflight::inspect(&mut staged_db).await?;
    staged_db.close().await.map_err(|e| e.to_string())?;
    for name in ITEMS {
        let path = app_dir.join(name);
        if path.try_exists().map_err(|e| e.to_string())? {
            backup::reject_link(&path)?;
        }
    }
    backup::write_json(&app_dir.join(INTENT), &RestoreIntent { id })?;
    let replacement = (|| -> SafetyResult<()> {
        for name in ITEMS {
            let active = app_dir.join(name);
            if active.try_exists().map_err(|e| e.to_string())? {
                fs::rename(active, original.join(name)).map_err(|e| e.to_string())?;
            }
        }
        for name in ["revisum.db", "images"] {
            fs::rename(candidate.join(name), app_dir.join(name)).map_err(|e| e.to_string())?;
        }
        Ok(())
    })();
    if let Err(error) = replacement {
        rollback_interrupted(app_dir)
            .map_err(|rollback| format!("{error}. Recuperação pendente: {rollback}"))?;
        return Err(format!(
            "Restauração não concluída; os arquivos anteriores foram recuperados: {error}"
        ));
    }
    let validation = async {
        let mut conn = preflight::open_readonly(&app_dir.join("revisum.db")).await?;
        preflight::inspect(&mut conn).await?;
        conn.close().await.map_err(|e| e.to_string())
    }
    .await;
    if let Err(error) = validation {
        rollback_interrupted(app_dir)?;
        return Err(error);
    }
    fs::remove_file(app_dir.join(INTENT)).map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg(test)]
pub fn simulate_intent(app_dir: &Path, id: &str) {
    backup::write_json(&app_dir.join(INTENT), &RestoreIntent { id: id.into() }).unwrap();
}
