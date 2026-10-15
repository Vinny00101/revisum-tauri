//! Read-only inspection before SQLx is allowed to write to an existing database.
use std::{collections::BTreeMap, future::Future, path::Path, pin::Pin, time::Duration};

use sha2::{Digest, Sha384};
use sqlx::{
    error::BoxDynError,
    migrate::{Migrate, Migration, MigrationSource, MigrationType, Migrator},
    sqlite::SqliteConnectOptions,
    Connection, Row, SqliteConnection,
};

pub type SafetyResult<T> = Result<T, String>;
pub const READER_GENERATION: i64 = 1;
const AUDIT_SQL: &str = "CREATE TABLE IF NOT EXISTS revisum_compatibility_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    migration_version INTEGER NOT NULL,
    previous_checksum BLOB,
    canonical_checksum BLOB NOT NULL,
    reason TEXT NOT NULL,
    backup_id TEXT NOT NULL,
    changed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)";

// Historical files stay untouched. Only their exact LF and CRLF representations
// are recognized. Normalizing the embedded copy makes all new builds identical.
const SCRIPTS: [&str; 4] = [
    include_str!("../../migrations/01_foo.sql"),
    include_str!("../../migrations/02_foo.sql"),
    include_str!("../../migrations/03_foo.sql"),
    include_str!("../../migrations/04_storage_safety.sql"),
];

#[derive(Debug)]
pub struct EmbeddedMigrations;
impl MigrationSource<'static> for EmbeddedMigrations {
    fn resolve(self) -> Pin<Box<dyn Future<Output = Result<Vec<Migration>, BoxDynError>> + Send>> {
        Box::pin(async { Ok(migrations()) })
    }
}

pub fn migrations() -> Vec<Migration> {
    SCRIPTS
        .iter()
        .enumerate()
        .map(|(index, sql)| {
            Migration::new(
                (index + 1) as i64,
                if index < 3 {
                    "foo".into()
                } else {
                    "storage safety".into()
                },
                MigrationType::Simple,
                sql.replace("\r\n", "\n").into(),
                false,
            )
        })
        .collect()
}

pub async fn migrator() -> SafetyResult<Migrator> {
    Migrator::new(EmbeddedMigrations)
        .await
        .map_err(|e| e.to_string())
}

pub fn options(path: &Path, read_only: bool) -> SqliteConnectOptions {
    SqliteConnectOptions::new()
        .filename(path)
        .read_only(read_only)
        .create_if_missing(false)
        .foreign_keys(true)
        .busy_timeout(Duration::from_secs(5))
}

pub async fn open_readonly(path: &Path) -> SafetyResult<SqliteConnection> {
    SqliteConnection::connect_with(&options(path, true))
        .await
        .map_err(|e| {
            format!("Não foi possível ler o banco existente. Ele não será substituído: {e}")
        })
}

#[derive(Debug)]
pub struct Inspection {
    pub version: usize,
    pub adopt_baseline: bool,
    pub checksum_changes: Vec<(i64, Vec<u8>)>,
}
impl Inspection {
    pub fn needs_changes(&self) -> bool {
        self.adopt_baseline || !self.checksum_changes.is_empty() || self.version < SCRIPTS.len()
    }
}

pub async fn validate_integrity(conn: &mut SqliteConnection) -> SafetyResult<()> {
    let checks: Vec<String> = sqlx::query_scalar("PRAGMA integrity_check(20)")
        .fetch_all(&mut *conn)
        .await
        .map_err(|e| format!("Falha ao verificar integridade: {e}"))?;
    if checks != ["ok"] {
        return Err("O banco não passou na verificação de integridade. Preserve o original e restaure um backup válido.".into());
    }
    if !sqlx::query("PRAGMA foreign_key_check")
        .fetch_all(&mut *conn)
        .await
        .map_err(|e| e.to_string())?
        .is_empty()
    {
        return Err("Foram encontrados vínculos inválidos no banco. Nenhum registro será apagado automaticamente.".into());
    }
    Ok(())
}

async fn schema(
    conn: &mut SqliteConnection,
) -> SafetyResult<BTreeMap<String, (String, String, String)>> {
    let rows = sqlx::query("SELECT name, type, tbl_name, sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' AND name != '_sqlx_migrations' ORDER BY name")
        .fetch_all(conn).await.map_err(|e| e.to_string())?;
    let mut result = BTreeMap::new();
    for row in rows {
        let sql: Option<String> = row.try_get("sql").map_err(|e| e.to_string())?;
        result.insert(
            row.get("name"),
            (
                row.get("type"),
                row.get("tbl_name"),
                // Preserve whitespace inside literals and line comments. Only
                // the exact historical line-ending variants are equivalent.
                sql.unwrap_or_default()
                    .replace("\r\n", "\n")
                    .trim()
                    .to_owned(),
            ),
        );
    }
    Ok(result)
}

async fn expected_schema(
    version: usize,
) -> SafetyResult<BTreeMap<String, (String, String, String)>> {
    let mut conn = SqliteConnection::connect("sqlite::memory:")
        .await
        .map_err(|e| e.to_string())?;
    for migration in migrations().iter().take(version) {
        sqlx::raw_sql(&migration.sql)
            .execute(&mut conn)
            .await
            .map_err(|e| e.to_string())?;
    }
    schema(&mut conn).await
}

pub async fn inspect(conn: &mut SqliteConnection) -> SafetyResult<Inspection> {
    validate_integrity(conn).await?;
    let user_version: i64 = sqlx::query_scalar("PRAGMA user_version")
        .fetch_one(&mut *conn)
        .await
        .map_err(|e| e.to_string())?;
    if user_version != 0 {
        return Err("O banco usa uma versão de schema não reconhecida por este aplicativo.".into());
    }
    let has_history: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM sqlite_master WHERE type='table' AND name='_sqlx_migrations')",
    )
    .fetch_one(&mut *conn)
    .await
    .map_err(|e| e.to_string())?;
    let mut actual = schema(conn).await?;
    // A bridge interrupted after commit but before migration 4 may already have
    // its audit table. It is accepted only with the exact canonical definition.
    let audit = actual.remove("revisum_compatibility_log");
    if let Some(ref found) = audit {
        let mut expected = expected_schema(4).await?;
        if Some(found) != expected.remove("revisum_compatibility_log").as_ref() {
            return Err("O registro de compatibilidade tem uma estrutura desconhecida.".into());
        }
    }
    if actual.contains_key("revisum_storage_compatibility") {
        let generations: Vec<(i64, i64)> = sqlx::query_as("SELECT format_generation, minimum_reader_generation FROM revisum_storage_compatibility")
            .fetch_all(&mut *conn).await.map_err(|e| e.to_string())?;
        if generations.len() != 1 || generations[0] != (READER_GENERATION, READER_GENERATION) {
            return Err("Este banco exige uma versão mais recente ou incompatível do Revisum. A escrita foi bloqueada.".into());
        }
    }
    if !has_history {
        if actual.is_empty() && audit.is_none() {
            return Ok(Inspection {
                version: 0,
                adopt_baseline: false,
                checksum_changes: vec![],
            });
        }
        for version in 1..=3 {
            if actual == expected_schema(version).await? && audit.is_none() {
                return Ok(Inspection {
                    version,
                    adopt_baseline: true,
                    checksum_changes: vec![],
                });
            }
        }
        return Err("Schema legado desconhecido. A migração automática foi bloqueada para preservar os dados.".into());
    }
    let applied: Vec<(i64, bool, Vec<u8>)> =
        sqlx::query_as("SELECT version, success, checksum FROM _sqlx_migrations ORDER BY version")
            .fetch_all(&mut *conn)
            .await
            .map_err(|e| e.to_string())?;
    let embedded = migrations();
    let mut changes = Vec::new();
    for (index, (version, success, checksum)) in applied.iter().enumerate() {
        if *version != (index + 1) as i64 || index >= embedded.len() || !success {
            return Err("Histórico de migrations incompleto, desconhecido ou mais recente. Nenhuma migration será executada.".into());
        }
        let canonical = &embedded[index];
        if checksum.as_slice() != canonical.checksum.as_ref() {
            let crlf = canonical.sql.replace('\n', "\r\n");
            if index >= 3 || checksum.as_slice() != Sha384::digest(crlf.as_bytes()).as_slice() {
                return Err(format!(
                    "Checksum desconhecido na migration {version}. O banco não será modificado."
                ));
            }
            changes.push((*version, checksum.clone()));
        }
    }
    let mut expected = expected_schema(applied.len()).await?;
    let required_audit = expected.remove("revisum_compatibility_log");
    if actual != expected || (required_audit.is_some() && audit.is_none()) {
        return Err("A estrutura do banco difere das migrations registradas. É necessário recuperar ou analisar este banco.".into());
    }
    Ok(Inspection {
        version: applied.len(),
        adopt_baseline: false,
        checksum_changes: changes,
    })
}

/// Called only after an independently verified backup, under the process lock.
pub async fn apply_compatibility(
    conn: &mut SqliteConnection,
    inspection: &Inspection,
    backup_id: &str,
) -> SafetyResult<()> {
    if !inspection.adopt_baseline && inspection.checksum_changes.is_empty() {
        return Ok(());
    }
    let embedded = migrations();
    let mut tx = conn.begin().await.map_err(|e| e.to_string())?;
    tx.ensure_migrations_table()
        .await
        .map_err(|e| e.to_string())?;
    sqlx::raw_sql(AUDIT_SQL)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
    if inspection.adopt_baseline {
        for migration in embedded.iter().take(inspection.version) {
            sqlx::query("INSERT INTO _sqlx_migrations(version, description, success, checksum, execution_time) VALUES (?, ?, 1, ?, 0)")
                .bind(migration.version).bind(migration.description.as_ref()).bind(migration.checksum.as_ref())
                .execute(&mut *tx).await.map_err(|e| e.to_string())?;
            sqlx::query("INSERT INTO revisum_compatibility_log(migration_version, canonical_checksum, reason, backup_id) VALUES (?, ?, 'adopt-recognized-baseline', ?)")
                .bind(migration.version).bind(migration.checksum.as_ref()).bind(backup_id)
                .execute(&mut *tx).await.map_err(|e| e.to_string())?;
        }
    }
    for (version, previous) in &inspection.checksum_changes {
        let migration = &embedded[(*version - 1) as usize];
        let changed = sqlx::query(
            "UPDATE _sqlx_migrations SET checksum=? WHERE version=? AND checksum=? AND success=1",
        )
        .bind(migration.checksum.as_ref())
        .bind(version)
        .bind(previous)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
        if changed.rows_affected() != 1 {
            return Err("O histórico mudou durante a manutenção.".into());
        }
        sqlx::query("INSERT INTO revisum_compatibility_log(migration_version, previous_checksum, canonical_checksum, reason, backup_id) VALUES (?, ?, ?, 'recognized-crlf-to-lf', ?)")
            .bind(version).bind(previous).bind(migration.checksum.as_ref()).bind(backup_id)
            .execute(&mut *tx).await.map_err(|e| e.to_string())?;
    }
    tx.commit().await.map_err(|e| e.to_string())
}

pub async fn counts(conn: &mut SqliteConnection) -> SafetyResult<BTreeMap<String, i64>> {
    let tables: Vec<String> = sqlx::query_scalar("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
        .fetch_all(&mut *conn).await.map_err(|e| e.to_string())?;
    let mut result = BTreeMap::new();
    for table in tables {
        let quoted = table.replace('"', "\"\"");
        let count = sqlx::query_scalar(&format!("SELECT COUNT(*) FROM \"{quoted}\""))
            .fetch_one(&mut *conn)
            .await
            .map_err(|e| e.to_string())?;
        result.insert(table, count);
    }
    Ok(result)
}
