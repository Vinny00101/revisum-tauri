use super::{backup, preflight, recovery, storage::StorageManager};
use sha2::{Digest, Sha384};
use sqlx::{migrate::Migrate, Connection, SqliteConnection};
use std::{fs, path::Path, time::Duration};
use tempfile::TempDir;

async fn legacy(root: &Path, version: usize, crlf: bool, history: bool) -> SqliteConnection {
    let path = root.join("revisum.db");
    let mut conn =
        SqliteConnection::connect_with(&preflight::options(&path, false).create_if_missing(true))
            .await
            .unwrap();
    for migration in preflight::migrations().iter().take(version) {
        let sql = if crlf {
            migration.sql.replace('\n', "\r\n")
        } else {
            migration.sql.to_string()
        };
        sqlx::raw_sql(&sql).execute(&mut conn).await.unwrap();
        if history {
            conn.ensure_migrations_table().await.unwrap();
            sqlx::query("INSERT INTO _sqlx_migrations(version, description, success, checksum, execution_time) VALUES (?, ?, 1, ?, 0)")
                .bind(migration.version).bind(migration.description.as_ref()).bind(Sha384::digest(sql.as_bytes()).to_vec())
                .execute(&mut conn).await.unwrap();
        }
    }
    conn
}

async fn seed(conn: &mut SqliteConnection) {
    sqlx::raw_sql("INSERT INTO user(id,username,email,password,created_at,updated_at) VALUES
      (1,'synthetic-one','one@example.test','test-hash','2026-01-01','2026-01-01'),
      (2,'synthetic-two','two@example.test','test-hash','2026-01-01','2026-01-01');
      INSERT INTO user_status(user_id) VALUES(1),(2);
      INSERT INTO discipline(id,user_id,name,created_at,updated_at) VALUES
      (1,1,'Same name','2026-01-01','2026-01-01'),(2,2,'Same name','2026-01-01','2026-01-01');
      INSERT INTO content(id,discipline_id,title,display_order,created_at,updated_at) VALUES
      (1,1,'First',1,'2026-01-01','2026-01-01'),(2,2,'Second',1,'2026-01-01','2026-01-01');
      INSERT INTO studyitem(id,content_id,item_type,created_at,updated_at) VALUES
      (1,1,'CARD','2026-01-01','2026-01-01'),(2,1,'QUESTION','2026-01-01','2026-01-01'),
      (3,2,'CARD','2026-01-01','2026-01-01'),(4,2,'QUESTION','2026-01-01','2026-01-01');
      INSERT INTO card(study_item_id,front,back,created_at,updated_at) VALUES
      (1,'Front one','Back one','2026-01-01','2026-01-01'),(3,'Front two','Back two','2026-01-01','2026-01-01');
      INSERT INTO question(id,study_item_id,question_type,statement_text,created_at,updated_at) VALUES
      (1,2,'OBJECTIVE','Statement one','2026-01-01','2026-01-01'),
      (2,4,'DISCURSIVE','Statement two','2026-01-01','2026-01-01');
      INSERT INTO objective_answer(question_id,text,is_correct) VALUES(1,'Correct',1),(1,'Wrong',0);
      INSERT INTO discursive_response(question_id,expected_answer,evaluation_criteria) VALUES(2,'Expected','Criteria');
      INSERT INTO review_session(id,user_id,discipline_id,content_id,session_type,start_time) VALUES
      (1,1,1,1,'CARD','2026-01-01T12:00:00Z'),(2,2,2,2,'DISCURSIVE','2026-01-02T12:00:00Z');
      UPDATE review_session SET end_time='2026-01-01T12:01:00Z',total_items=1 WHERE id=1;
      INSERT INTO reviewlog(session_id,user_id,study_item_id,item_type,evaluation,time_spent,review_time) VALUES
      (1,1,1,'CARD','EASY',60,'2026-01-01T12:01:00Z'),(2,2,4,'DISCURSIVE','HARD',20,'2026-01-02T12:00:20Z');
      INSERT INTO study_item_review_state(user_id,study_item_id,repetition,next_review_date) VALUES
      (1,1,3,'2026-01-04'),(2,4,1,'2026-01-03');")
      .execute(conn).await.unwrap();
}

async fn close(manager: StorageManager, store: Option<super::config::DbStore>) {
    if let Some(store) = store {
        store.pool.close().await;
    }
    drop(manager);
}

#[tokio::test]
async fn empty_database_is_created_once_and_has_foreign_keys() {
    let dir = TempDir::new().unwrap();
    let (manager, store) = StorageManager::initialize(dir.path().to_owned()).await;
    assert_eq!(
        manager.status().state,
        "ready",
        "{}",
        manager.status().message
    );
    assert_eq!(manager.status().schema_version, Some(4));
    assert!(manager.list_backups().unwrap().is_empty());
    let pool = &store.as_ref().unwrap().pool;
    assert_eq!(
        sqlx::query_scalar::<_, i64>("PRAGMA foreign_keys")
            .fetch_one(pool)
            .await
            .unwrap(),
        1
    );
    close(manager, store).await;
    let (manager, store) = StorageManager::initialize(dir.path().to_owned()).await;
    assert_eq!(
        manager.status().state,
        "ready",
        "{}",
        manager.status().message
    );
    assert!(manager.list_backups().unwrap().is_empty());
    close(manager, store).await;
}

#[tokio::test]
async fn lf_and_crlf_databases_preserve_every_domain_table_and_audit_only_known_changes() {
    for crlf in [false, true] {
        let dir = TempDir::new().unwrap();
        let mut conn = legacy(dir.path(), 3, crlf, true).await;
        seed(&mut conn).await;
        let before = preflight::counts(&mut conn).await.unwrap();
        conn.close().await.unwrap();
        let (manager, store) = StorageManager::initialize(dir.path().to_owned()).await;
        assert_eq!(
            manager.status().state,
            "ready",
            "{}",
            manager.status().message
        );
        let mut check = store.as_ref().unwrap().pool.acquire().await.unwrap();
        let after = preflight::counts(&mut check).await.unwrap();
        for (table, count) in before {
            if table != "_sqlx_migrations" {
                assert_eq!(after[&table], count, "{table}");
            }
        }
        let audit: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM revisum_compatibility_log")
            .fetch_one(&mut *check)
            .await
            .unwrap();
        assert_eq!(audit, if crlf { 3 } else { 0 });
        let logs: Vec<(i64, i64, i64, String)> = sqlx::query_as(
            "SELECT session_id,user_id,study_item_id,evaluation FROM reviewlog ORDER BY id",
        )
        .fetch_all(&mut *check)
        .await
        .unwrap();
        assert_eq!(
            logs,
            vec![(1, 1, 1, "EASY".into()), (2, 2, 4, "HARD".into())]
        );
        drop(check);
        let saved = manager.list_backups().unwrap();
        assert_eq!(saved.len(), 1);
        assert_eq!(
            backup::verify_backup(dir.path(), &saved[0].id)
                .await
                .unwrap()
                .schema_version,
            3
        );
        close(manager, store).await;
        let (manager, store) = StorageManager::initialize(dir.path().to_owned()).await;
        assert_eq!(
            manager.status().state,
            "ready",
            "{}",
            manager.status().message
        );
        assert_eq!(manager.list_backups().unwrap().len(), 1);
        close(manager, store).await;
    }
}

#[tokio::test]
async fn known_partial_histories_and_baselines_are_upgraded_without_reapplying_tables() {
    for version in 1..=3 {
        for history in [false, true] {
            let dir = TempDir::new().unwrap();
            let mut conn = legacy(dir.path(), version, false, history).await;
            sqlx::query("INSERT INTO user(username,password,created_at,updated_at) VALUES('preserve','hash','2026-01-01','2026-01-01')")
                .execute(&mut conn).await.unwrap();
            conn.close().await.unwrap();
            let (manager, store) = StorageManager::initialize(dir.path().to_owned()).await;
            assert_eq!(
                manager.status().state,
                "ready",
                "v{version} history={history}: {}",
                manager.status().message
            );
            let pool = &store.as_ref().unwrap().pool;
            let names: Vec<String> = sqlx::query_scalar("SELECT username FROM user")
                .fetch_all(pool)
                .await
                .unwrap();
            assert_eq!(names, vec!["preserve"]);
            close(manager, store).await;
        }
    }
}

#[tokio::test]
async fn unknown_checksum_future_history_dirty_history_and_altered_schema_are_read_only_failures() {
    for mutation in [
        "UPDATE _sqlx_migrations SET checksum=x'012345' WHERE version=2",
        "INSERT INTO _sqlx_migrations(version,description,success,checksum,execution_time) VALUES(99,'future',1,x'00',0)",
        "UPDATE _sqlx_migrations SET success=0 WHERE version=2",
        "DELETE FROM _sqlx_migrations WHERE version=2",
        "ALTER TABLE user ADD COLUMN unexpected TEXT",
        "PRAGMA user_version=99",
    ] {
        let dir = TempDir::new().unwrap();
        let mut conn = legacy(dir.path(), 3, false, true).await;
        sqlx::raw_sql(mutation).execute(&mut conn).await.unwrap();
        conn.close().await.unwrap();
        let before = fs::read(dir.path().join("revisum.db")).unwrap();
        let (manager, store) = StorageManager::initialize(dir.path().to_owned()).await;
        assert_eq!(manager.status().state, "recovery_required", "{mutation}");
        assert!(store.is_none());
        assert!(manager.list_backups().unwrap().is_empty());
        drop(manager);
        assert_eq!(fs::read(dir.path().join("revisum.db")).unwrap(), before, "{mutation}");
    }
}

#[tokio::test]
async fn corrupt_unknown_and_missing_main_database_never_become_empty_study_databases() {
    for case in ["corrupt", "unknown", "orphan-wal", "directory"] {
        let dir = TempDir::new().unwrap();
        let path = dir.path().join("revisum.db");
        match case {
            "corrupt" => fs::write(&path, b"original damaged database").unwrap(),
            "directory" => fs::create_dir(&path).unwrap(),
            "orphan-wal" => fs::write(dir.path().join("revisum.db-wal"), b"retain").unwrap(),
            _ => {
                let mut conn = legacy(dir.path(), 0, false, false).await;
                sqlx::query("CREATE TABLE unknown(data TEXT)")
                    .execute(&mut conn)
                    .await
                    .unwrap();
                conn.close().await.unwrap();
            }
        }
        let before = fs::read(&path).ok();
        let (manager, store) = StorageManager::initialize(dir.path().to_owned()).await;
        assert!(store.is_none(), "{case}");
        assert_eq!(manager.status().state, "recovery_required");
        assert_eq!(fs::read(&path).ok(), before);
        if case == "orphan-wal" {
            assert!(!path.exists());
        }
    }
}

#[tokio::test]
async fn invalid_foreign_keys_block_migration_without_deleting_orphans() {
    let dir = TempDir::new().unwrap();
    let mut conn = legacy(dir.path(), 3, false, true).await;
    sqlx::raw_sql("PRAGMA foreign_keys=OFF; INSERT INTO discipline(user_id,name,created_at,updated_at) VALUES(999,'orphan','2026-01-01','2026-01-01');")
        .execute(&mut conn).await.unwrap();
    conn.close().await.unwrap();
    let before = fs::read(dir.path().join("revisum.db")).unwrap();
    let (manager, store) = StorageManager::initialize(dir.path().to_owned()).await;
    assert!(store.is_none());
    assert!(manager.status().message.contains("vínculos"));
    assert_eq!(fs::read(dir.path().join("revisum.db")).unwrap(), before);
}

#[tokio::test]
async fn failed_backup_prevents_checksum_updates_and_pending_migrations() {
    let dir = TempDir::new().unwrap();
    legacy(dir.path(), 3, true, true)
        .await
        .close()
        .await
        .unwrap();
    fs::write(dir.path().join("backups"), b"not a directory").unwrap();
    let before = fs::read(dir.path().join("revisum.db")).unwrap();
    let (manager, store) = StorageManager::initialize(dir.path().to_owned()).await;
    assert!(store.is_none());
    assert_eq!(manager.status().state, "recovery_required");
    assert_eq!(fs::read(dir.path().join("revisum.db")).unwrap(), before);
}

#[tokio::test]
async fn empty_existing_database_and_unicode_path_are_supported() {
    let parent = TempDir::new().unwrap();
    let root = parent.path().join("Revisum com espaço ç #");
    fs::create_dir(&root).unwrap();
    fs::write(root.join("revisum.db"), []).unwrap();
    let (manager, store) = StorageManager::initialize(root).await;
    assert_eq!(
        manager.status().state,
        "ready",
        "{}",
        manager.status().message
    );
    assert_eq!(manager.list_backups().unwrap().len(), 1);
    close(manager, store).await;
}

#[tokio::test]
async fn manifests_cannot_escape_the_payload_and_backups_are_bound_to_their_data_directory() {
    let dir = TempDir::new().unwrap();
    let (manager, store) = StorageManager::initialize(dir.path().to_owned()).await;
    let saved = manager.create_backup().await.unwrap();
    let manifest_path = dir
        .path()
        .join("backups")
        .join(&saved.id)
        .join("manifest.json");
    let mut modified = saved.clone();
    modified.files[0].path = "../private-file".into();
    fs::write(&manifest_path, serde_json::to_vec(&modified).unwrap()).unwrap();
    assert!(manager.restore_backup(&saved.id).await.is_err());
    modified = saved.clone();
    modified.source_directory = dir.path().join("different-source");
    fs::write(&manifest_path, serde_json::to_vec(&modified).unwrap()).unwrap();
    assert!(manager
        .restore_backup(&saved.id)
        .await
        .unwrap_err()
        .contains("outra pasta"));
    assert!(store.as_ref().unwrap().access().await.is_ok());
    close(manager, store).await;
}

#[tokio::test]
async fn referenced_images_must_be_present_and_inside_the_managed_directory() {
    let dir = TempDir::new().unwrap();
    let outside = TempDir::new().unwrap();
    let (manager, store) = StorageManager::initialize(dir.path().to_owned()).await;
    let store = store.unwrap();
    sqlx::query("INSERT INTO user(username,password,avatar_path,created_at,updated_at) VALUES('image-user','hash',?,'2026-01-01','2026-01-01')")
        .bind(dir.path().join("images/missing.png").to_str().unwrap()).execute(&store.pool).await.unwrap();
    assert!(manager
        .create_backup()
        .await
        .unwrap_err()
        .contains("não foi encontrada"));
    let external = outside.path().join("private.png");
    fs::write(&external, b"outside").unwrap();
    sqlx::query("UPDATE user SET avatar_path=?")
        .bind(external.to_str().unwrap())
        .execute(&store.pool)
        .await
        .unwrap();
    assert!(manager
        .create_backup()
        .await
        .unwrap_err()
        .contains("fora da pasta"));
    let internal = dir.path().join("images/avatar.png");
    fs::write(&internal, b"managed").unwrap();
    sqlx::query("UPDATE user SET avatar_path=?")
        .bind(internal.to_str().unwrap())
        .execute(&store.pool)
        .await
        .unwrap();
    let saved = manager.create_backup().await.unwrap();
    assert!(saved
        .files
        .iter()
        .any(|entry| entry.path == "images/avatar.png"));
    close(manager, Some(store)).await;
}

#[test]
fn embedded_migration_registry_includes_every_migration_file() {
    let count = fs::read_dir(Path::new(env!("CARGO_MANIFEST_DIR")).join("migrations"))
        .unwrap()
        .filter_map(Result::ok)
        .filter(|entry| entry.path().extension().is_some_and(|value| value == "sql"))
        .count();
    assert_eq!(
        count,
        preflight::migrations().len(),
        "Register every new migration in preflight::SCRIPTS"
    );
}

#[tokio::test]
async fn second_instance_is_blocked_and_cannot_restore_the_first_instances_data() {
    let dir = TempDir::new().unwrap();
    let (first, store) = StorageManager::initialize(dir.path().to_owned()).await;
    assert!(store.is_some(), "{}", first.status().message);
    let (second, other) = StorageManager::initialize(dir.path().to_owned()).await;
    assert!(other.is_none());
    assert!(second.status().message.contains("instância"));
    assert!(second
        .restore_backup("anything")
        .await
        .unwrap_err()
        .contains("instância"));
    close(first, store).await;
}

#[tokio::test]
async fn wal_snapshot_and_images_restore_together_and_previous_data_is_retained() {
    let dir = TempDir::new().unwrap();
    let (manager, store) = StorageManager::initialize(dir.path().to_owned()).await;
    let store = store.unwrap();
    let mut conn = store.pool.acquire().await.unwrap();
    seed(&mut conn).await;
    drop(conn);
    fs::create_dir_all(dir.path().join("images/question")).unwrap();
    fs::write(
        dir.path().join("images/question/one.png"),
        b"original image",
    )
    .unwrap();
    assert!(
        fs::metadata(dir.path().join("revisum.db-wal"))
            .unwrap()
            .len()
            > 0
    );
    let snapshot = manager.create_backup().await.unwrap();
    sqlx::query("UPDATE content SET title='after backup' WHERE id=1")
        .execute(&store.pool)
        .await
        .unwrap();
    fs::write(dir.path().join("images/question/one.png"), b"newer image").unwrap();
    manager.restore_backup(&snapshot.id).await.unwrap();
    assert_eq!(manager.status().state, "restart_required");
    assert!(store.access().await.is_err());
    assert_eq!(
        fs::read(dir.path().join("images/question/one.png")).unwrap(),
        b"original image"
    );
    let mut conn = preflight::open_readonly(&dir.path().join("revisum.db"))
        .await
        .unwrap();
    assert_eq!(
        sqlx::query_scalar::<_, String>("SELECT title FROM content WHERE id=1")
            .fetch_one(&mut conn)
            .await
            .unwrap(),
        "First"
    );
    conn.close().await.unwrap();
    assert_eq!(manager.list_backups().unwrap().len(), 2);
    assert!(fs::read_dir(dir.path().join("recovery"))
        .unwrap()
        .next()
        .is_some());
    close(manager, Some(store)).await;
    let (manager, store) = StorageManager::initialize(dir.path().to_owned()).await;
    assert_eq!(
        manager.status().state,
        "ready",
        "{}",
        manager.status().message
    );
    close(manager, store).await;
}

#[tokio::test]
async fn corrupted_backup_and_path_traversal_cannot_close_or_replace_a_ready_database() {
    let dir = TempDir::new().unwrap();
    let (manager, store) = StorageManager::initialize(dir.path().to_owned()).await;
    let saved = manager.create_backup().await.unwrap();
    fs::write(
        dir.path()
            .join("backups")
            .join(&saved.id)
            .join("revisum.db"),
        b"changed",
    )
    .unwrap();
    assert!(manager.restore_backup(&saved.id).await.is_err());
    assert!(manager.restore_backup("../../revisum.db").await.is_err());
    assert_eq!(manager.status().state, "ready");
    assert!(store.as_ref().unwrap().access().await.is_ok());
    close(manager, store).await;
}

#[tokio::test]
async fn recovery_screen_can_restore_a_valid_backup_over_corrupt_active_data() {
    let dir = TempDir::new().unwrap();
    let (manager, store) = StorageManager::initialize(dir.path().to_owned()).await;
    let saved = manager.create_backup().await.unwrap();
    close(manager, store).await;
    fs::write(
        dir.path().join("revisum.db"),
        b"retain this damaged original",
    )
    .unwrap();
    let (manager, store) = StorageManager::initialize(dir.path().to_owned()).await;
    assert!(store.is_none());
    manager.restore_backup(&saved.id).await.unwrap();
    assert_eq!(manager.status().state, "restart_required");
    drop(manager);
    let (manager, store) = StorageManager::initialize(dir.path().to_owned()).await;
    assert_eq!(
        manager.status().state,
        "ready",
        "{}",
        manager.status().message
    );
    close(manager, store).await;
}

#[tokio::test]
async fn maintenance_waits_for_entire_command_and_future_reader_generation_is_rejected() {
    let dir = TempDir::new().unwrap();
    let (manager, store) = StorageManager::initialize(dir.path().to_owned()).await;
    let access = store.as_ref().unwrap().access().await.unwrap();
    assert!(
        tokio::time::timeout(Duration::from_millis(30), manager.create_backup())
            .await
            .is_err()
    );
    drop(access);
    manager.create_backup().await.unwrap();
    sqlx::query("UPDATE revisum_storage_compatibility SET minimum_reader_generation=2")
        .execute(&store.as_ref().unwrap().pool)
        .await
        .unwrap();
    close(manager, store).await;
    let (manager, store) = StorageManager::initialize(dir.path().to_owned()).await;
    assert!(store.is_none());
    assert!(manager.status().message.contains("incompatível"));
}

#[tokio::test]
async fn sqlx_rolls_back_failed_migration_and_its_history_entry() {
    let dir = TempDir::new().unwrap();
    let mut conn = legacy(dir.path(), 4, false, true).await;
    let mut migrator = preflight::migrator().await.unwrap();
    migrator
        .migrations
        .to_mut()
        .push(sqlx::migrate::Migration::new(
            5,
            "broken test".into(),
            sqlx::migrate::MigrationType::Simple,
            "CREATE TABLE should_rollback(id INTEGER); INSERT INTO missing_table VALUES(1);".into(),
            false,
        ));
    assert!(migrator.run(&mut conn).await.is_err());
    assert_eq!(
        sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM sqlite_master WHERE name='should_rollback'"
        )
        .fetch_one(&mut conn)
        .await
        .unwrap(),
        0
    );
    assert_eq!(
        sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM _sqlx_migrations WHERE version=5")
            .fetch_one(&mut conn)
            .await
            .unwrap(),
        0
    );
    assert!(!preflight::inspect(&mut conn).await.unwrap().needs_changes());
}

#[test]
fn restore_interruption_at_each_move_is_recoverable_and_rollback_is_idempotent() {
    for cut in 0..=6 {
        let dir = TempDir::new().unwrap();
        fs::write(dir.path().join("revisum.db"), b"original").unwrap();
        fs::write(dir.path().join("revisum.db-wal"), b"original wal").unwrap();
        fs::write(dir.path().join("revisum.db-shm"), b"original shm").unwrap();
        fs::create_dir(dir.path().join("images")).unwrap();
        fs::write(dir.path().join("images/one"), b"old image").unwrap();
        let id = uuid::Uuid::new_v4().to_string();
        let transaction = dir.path().join("recovery").join(&id);
        let candidate = transaction.join("candidate");
        let previous = transaction.join("previous");
        fs::create_dir_all(candidate.join("images")).unwrap();
        fs::create_dir(&previous).unwrap();
        fs::write(candidate.join("revisum.db"), b"replacement").unwrap();
        fs::write(candidate.join("images/one"), b"new image").unwrap();
        recovery::simulate_intent(dir.path(), &id);
        if cut >= 1 {
            fs::rename(dir.path().join("revisum.db"), previous.join("revisum.db")).unwrap();
        }
        if cut >= 2 {
            fs::rename(
                dir.path().join("revisum.db-wal"),
                previous.join("revisum.db-wal"),
            )
            .unwrap();
        }
        if cut >= 3 {
            fs::rename(
                dir.path().join("revisum.db-shm"),
                previous.join("revisum.db-shm"),
            )
            .unwrap();
        }
        if cut >= 4 {
            fs::rename(dir.path().join("images"), previous.join("images")).unwrap();
        }
        if cut >= 5 {
            fs::rename(candidate.join("revisum.db"), dir.path().join("revisum.db")).unwrap();
            fs::write(dir.path().join("revisum.db-wal"), b"replacement wal").unwrap();
            fs::write(dir.path().join("revisum.db-shm"), b"replacement shm").unwrap();
        }
        if cut >= 6 {
            fs::rename(candidate.join("images"), dir.path().join("images")).unwrap();
        }
        assert!(recovery::rollback_interrupted(dir.path()).unwrap());
        assert_eq!(
            fs::read(dir.path().join("revisum.db")).unwrap(),
            b"original",
            "cut {cut}"
        );
        assert_eq!(
            fs::read(dir.path().join("images/one")).unwrap(),
            b"old image",
            "cut {cut}"
        );
        assert_eq!(
            fs::read(dir.path().join("revisum.db-wal")).unwrap(),
            b"original wal",
            "cut {cut}"
        );
        assert_eq!(
            fs::read(dir.path().join("revisum.db-shm")).unwrap(),
            b"original shm",
            "cut {cut}"
        );
        recovery::simulate_intent(dir.path(), &id);
        assert!(recovery::rollback_interrupted(dir.path()).unwrap());
        assert_eq!(
            fs::read(dir.path().join("revisum.db")).unwrap(),
            b"original"
        );
        assert_eq!(
            fs::read(dir.path().join("revisum.db-wal")).unwrap(),
            b"original wal"
        );
        assert!(!recovery::rollback_interrupted(dir.path()).unwrap());
    }
}

#[test]
fn backup_payload_rejects_absolute_and_escaping_paths() {
    let dir = TempDir::new().unwrap();
    for path in [
        "../outside",
        "/etc/passwd",
        "C:/private",
        "images/../../outside",
        "images\\..\\outside",
        "store.json",
    ] {
        assert!(backup::payload_path(dir.path(), path).is_err(), "{path}");
    }
}

#[cfg(unix)]
#[test]
fn backup_payload_rejects_symbolic_links() {
    let dir = TempDir::new().unwrap();
    let outside = TempDir::new().unwrap();
    std::os::unix::fs::symlink(outside.path(), dir.path().join("images")).unwrap();
    assert!(backup::image_files(dir.path()).is_err());
    assert!(backup::payload_path(dir.path(), "images/private").is_err());
}
