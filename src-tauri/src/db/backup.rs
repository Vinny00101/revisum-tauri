use std::{
    collections::{BTreeMap, BTreeSet},
    fs::{self, File, OpenOptions},
    io::{Read, Write},
    path::{Component, Path, PathBuf},
};

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use sqlx::{Connection, SqliteConnection};
use uuid::Uuid;

use super::preflight::{self, SafetyResult};

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct BackupFile {
    pub path: String,
    pub bytes: u64,
    pub sha256: String,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct BackupManifest {
    pub format: u32,
    pub id: String,
    pub created_at: String,
    pub app_version: String,
    pub source_directory: PathBuf,
    pub schema_version: usize,
    pub reason: String,
    pub tables: BTreeMap<String, i64>,
    pub files: Vec<BackupFile>,
}

pub fn ensure_directory(path: &Path) -> SafetyResult<()> {
    if path.try_exists().map_err(|e| e.to_string())? {
        reject_link(path)?;
        if !path.is_dir() {
            return Err(format!("Não é um diretório: {}", path.display()));
        }
    } else {
        fs::create_dir(path)
            .map_err(|e| format!("Não foi possível criar {}: {e}", path.display()))?;
    }
    Ok(())
}

pub fn reject_link(path: &Path) -> SafetyResult<()> {
    let metadata = fs::symlink_metadata(path).map_err(|e| e.to_string())?;
    let linked = metadata.file_type().is_symlink();
    #[cfg(windows)]
    let linked = {
        use std::os::windows::fs::MetadataExt;
        linked || metadata.file_attributes() & 0x400 != 0
    };
    if linked {
        return Err(format!(
            "Links de arquivos ou diretórios não são aceitos na proteção dos dados: {}",
            path.display()
        ));
    }
    Ok(())
}

pub fn file_record(base: &Path, relative: &str) -> SafetyResult<BackupFile> {
    let path = payload_path(base, relative)?;
    let mut file = File::open(&path).map_err(|e| e.to_string())?;
    if !file.metadata().map_err(|e| e.to_string())?.is_file() {
        return Err("O backup contém um arquivo especial.".into());
    }
    let mut hash = Sha256::new();
    let mut buffer = [0u8; 64 * 1024];
    let mut bytes = 0;
    loop {
        let read = file.read(&mut buffer).map_err(|e| e.to_string())?;
        if read == 0 {
            break;
        }
        hash.update(&buffer[..read]);
        bytes += read as u64;
    }
    Ok(BackupFile {
        path: relative.to_string(),
        bytes,
        sha256: format!("{:x}", hash.finalize()),
    })
}

pub fn payload_path(base: &Path, relative: &str) -> SafetyResult<PathBuf> {
    if relative.contains('\\') || relative.contains(':') || relative.is_empty() {
        return Err("Caminho de backup inválido.".into());
    }
    let relative_path = Path::new(relative);
    if !relative_path
        .components()
        .all(|c| matches!(c, Component::Normal(_)))
        || !(relative == "revisum.db" || relative.starts_with("images/"))
    {
        return Err("O caminho do backup está fora dos arquivos autorizados.".into());
    }
    reject_link(base)?;
    let mut current = base.to_path_buf();
    for component in relative_path.components() {
        current.push(component);
        if current.try_exists().map_err(|e| e.to_string())? {
            reject_link(&current)?;
        }
    }
    Ok(current)
}

pub fn image_files(root: &Path) -> SafetyResult<Vec<String>> {
    fn visit(base: &Path, dir: &Path, result: &mut Vec<String>) -> SafetyResult<()> {
        reject_link(dir)?;
        for entry in fs::read_dir(dir).map_err(|e| e.to_string())? {
            let path = entry.map_err(|e| e.to_string())?.path();
            reject_link(&path)?;
            if path.is_dir() {
                visit(base, &path, result)?;
            } else if path.is_file() {
                result.push(
                    path.strip_prefix(base)
                        .map_err(|e| e.to_string())?
                        .to_str()
                        .ok_or("Nome de arquivo não é UTF-8.")?
                        .replace('\\', "/"),
                );
            } else {
                return Err("Arquivo especial encontrado na biblioteca de imagens.".into());
            }
        }
        Ok(())
    }
    let mut result = vec![];
    let images = root.join("images");
    if images.try_exists().map_err(|e| e.to_string())? {
        visit(root, &images, &mut result)?;
    }
    result.sort();
    Ok(result)
}

pub fn write_json(path: &Path, value: &impl Serialize) -> SafetyResult<()> {
    let bytes = serde_json::to_vec_pretty(value).map_err(|e| e.to_string())?;
    let mut file = File::create_new(path).map_err(|e| e.to_string())?;
    file.write_all(&bytes)
        .and_then(|_| file.sync_all())
        .map_err(|e| e.to_string())
}

fn sync_file(path: &Path) -> SafetyResult<()> {
    OpenOptions::new()
        .write(true)
        .open(path)
        .and_then(|file| file.sync_all())
        .map_err(|e| e.to_string())
}

fn copy_images(source: &Path, destination: &Path) -> SafetyResult<Vec<BackupFile>> {
    ensure_directory(&destination.join("images"))?;
    let mut records = vec![];
    for relative in image_files(source)? {
        let source_file = payload_path(source, &relative)?;
        let target = payload_path(destination, &relative)?;
        if let Some(parent) = target.parent() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        let before = file_record(source, &relative)?;
        fs::copy(source_file, &target).map_err(|e| format!("Falha ao copiar imagem: {e}"))?;
        sync_file(&target)?;
        let after = file_record(destination, &relative)?;
        if before.bytes != after.bytes || before.sha256 != after.sha256 {
            return Err("Uma imagem mudou durante a cópia; repita o backup.".into());
        }
        records.push(after);
    }
    Ok(records)
}

async fn validate_image_references(
    app_dir: &Path,
    conn: &mut SqliteConnection,
    version: usize,
) -> SafetyResult<()> {
    if version == 0 {
        return Ok(());
    }
    let references: Vec<String> = sqlx::query_scalar("SELECT avatar_path FROM user WHERE avatar_path IS NOT NULL AND avatar_path != '' UNION SELECT statement_image FROM question WHERE statement_image IS NOT NULL AND statement_image != '' UNION SELECT image FROM objective_answer WHERE image IS NOT NULL AND image != ''")
        .fetch_all(conn).await.map_err(|e| e.to_string())?;
    if references.is_empty() {
        return Ok(());
    }
    let images = fs::canonicalize(app_dir.join("images")).map_err(|_| "Há imagens referenciadas no banco, mas a pasta de imagens está ausente. Recupere esses arquivos antes de atualizar.")?;
    for reference in references {
        let path = Path::new(&reference);
        let canonical = fs::canonicalize(path).map_err(|_| "Há uma imagem referenciada que não foi encontrada. Nenhum dado foi apagado; recupere a imagem antes de prosseguir.")?;
        if !canonical.starts_with(&images) {
            return Err("Há imagens fora da pasta gerenciada. Preserve esses arquivos e regularize os caminhos antes da manutenção.".into());
        }
        let relative = canonical
            .strip_prefix(fs::canonicalize(app_dir).map_err(|e| e.to_string())?)
            .map_err(|e| e.to_string())?;
        let relative = relative
            .to_str()
            .ok_or("Caminho de imagem inválido.")?
            .replace('\\', "/");
        payload_path(app_dir, &relative)?;
    }
    Ok(())
}

/// VACUUM INTO creates a SQLite snapshot including committed WAL pages. Callers
/// hold the maintenance gate so DB changes and image changes cannot interleave.
pub async fn create_backup(
    app_dir: &Path,
    conn: &mut SqliteConnection,
    reason: &str,
) -> SafetyResult<BackupManifest> {
    let inspection = preflight::inspect(conn).await?;
    validate_image_references(app_dir, conn, inspection.version).await?;
    let tables = preflight::counts(conn).await?;
    let backups = app_dir.join("backups");
    ensure_directory(&backups)?;
    let id = Uuid::new_v4().to_string();
    let staging = backups.join(format!(".incomplete-{id}"));
    ensure_directory(&staging)?;
    let target = staging.join("revisum.db");
    sqlx::query("VACUUM INTO ?")
        .bind(target.to_str().ok_or("Caminho de backup inválido.")?)
        .execute(&mut *conn)
        .await
        .map_err(|e| format!("O backup não pôde ser criado; a manutenção foi cancelada: {e}"))?;
    sync_file(&target)?;
    let mut snapshot = preflight::open_readonly(&target).await?;
    preflight::validate_integrity(&mut snapshot).await?;
    if preflight::counts(&mut snapshot).await? != tables {
        return Err("A conferência dos registros do backup falhou.".into());
    }
    snapshot.close().await.map_err(|e| e.to_string())?;
    let source = app_dir.to_path_buf();
    let destination = staging.clone();
    let mut files = tokio::task::spawn_blocking(move || copy_images(&source, &destination))
        .await
        .map_err(|e| e.to_string())??;
    files.push(file_record(&staging, "revisum.db")?);
    files.sort_by(|a, b| a.path.cmp(&b.path));
    let manifest = BackupManifest {
        format: 1,
        id: id.clone(),
        created_at: chrono::Utc::now().to_rfc3339(),
        app_version: env!("CARGO_PKG_VERSION").into(),
        source_directory: fs::canonicalize(app_dir).map_err(|e| e.to_string())?,
        schema_version: inspection.version,
        reason: reason.into(),
        tables,
        files,
    };
    write_json(&staging.join("manifest.json"), &manifest)?;
    fs::rename(&staging, backups.join(&id)).map_err(|e| e.to_string())?;
    Ok(manifest)
}

pub fn backup_dir(app_dir: &Path, id: &str) -> SafetyResult<PathBuf> {
    let uuid = Uuid::parse_str(id).map_err(|_| "Identificador de backup inválido.")?;
    if uuid.to_string() != id {
        return Err("Identificador de backup inválido.".into());
    }
    let backups = app_dir.join("backups");
    reject_link(&backups)?;
    let path = backups.join(id);
    reject_link(&path)?;
    Ok(path)
}

pub fn read_manifest(app_dir: &Path, id: &str) -> SafetyResult<BackupManifest> {
    let dir = backup_dir(app_dir, id)?;
    let path = dir.join("manifest.json");
    reject_link(&path)?;
    if fs::metadata(&path).map_err(|e| e.to_string())?.len() > 16 * 1024 * 1024 {
        return Err("Manifesto excede o limite de tamanho.".into());
    }
    let manifest: BackupManifest =
        serde_json::from_slice(&fs::read(path).map_err(|e| e.to_string())?)
            .map_err(|e| e.to_string())?;
    if manifest.format != 1 || manifest.id != id {
        return Err("Formato ou identidade do backup incompatível.".into());
    }
    Ok(manifest)
}

pub async fn verify_backup(app_dir: &Path, id: &str) -> SafetyResult<BackupManifest> {
    let root = app_dir.to_path_buf();
    let backup_id = id.to_string();
    let manifest = tokio::task::spawn_blocking(move || {
        let manifest = read_manifest(&root, &backup_id)?;
        let dir = backup_dir(&root, &backup_id)?;
        let mut expected = BTreeSet::new();
        for entry in &manifest.files {
            if !expected.insert(entry.path.clone()) {
                return Err("Arquivo duplicado no manifesto.".into());
            }
            let actual = file_record(&dir, &entry.path)?;
            if actual.bytes != entry.bytes || actual.sha256 != entry.sha256 {
                return Err(format!("Backup danificado: {}", entry.path));
            }
        }
        let mut actual: BTreeSet<_> = image_files(&dir)?.into_iter().collect();
        actual.insert("revisum.db".into());
        if actual != expected {
            return Err("O inventário dos arquivos do backup não confere.".into());
        }
        Ok(manifest)
    })
    .await
    .map_err(|e| e.to_string())??;
    let dir = backup_dir(app_dir, id)?;
    let mut conn = preflight::open_readonly(&dir.join("revisum.db")).await?;
    let inspection = preflight::inspect(&mut conn).await?;
    if inspection.version != manifest.schema_version
        || preflight::counts(&mut conn).await? != manifest.tables
    {
        return Err("O schema ou os registros do backup não conferem com o manifesto.".into());
    }
    conn.close().await.map_err(|e| e.to_string())?;
    Ok(manifest)
}

pub fn list_backups(app_dir: &Path) -> SafetyResult<Vec<BackupManifest>> {
    let backups = app_dir.join("backups");
    if !backups.try_exists().map_err(|e| e.to_string())? {
        return Ok(vec![]);
    }
    reject_link(&backups)?;
    let mut result = vec![];
    for entry in fs::read_dir(backups).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let id = entry.file_name().to_string_lossy().to_string();
        if Uuid::parse_str(&id).is_ok() {
            if let Ok(manifest) = read_manifest(app_dir, &id) {
                result.push(manifest);
            }
        }
    }
    result.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    Ok(result)
}

pub fn stage_payload(app_dir: &Path, id: &str, destination: &Path) -> SafetyResult<()> {
    let source = backup_dir(app_dir, id)?;
    let manifest = read_manifest(app_dir, id)?;
    ensure_directory(destination)?;
    ensure_directory(&destination.join("images"))?;
    for entry in manifest.files {
        let target = payload_path(destination, &entry.path)?;
        if let Some(parent) = target.parent() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        fs::copy(payload_path(&source, &entry.path)?, &target).map_err(|e| e.to_string())?;
        sync_file(&target)?;
        let actual = file_record(destination, &entry.path)?;
        if actual.sha256 != entry.sha256 || actual.bytes != entry.bytes {
            return Err("O backup mudou durante a preparação da restauração.".into());
        }
    }
    Ok(())
}
