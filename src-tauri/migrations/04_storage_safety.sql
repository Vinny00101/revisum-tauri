CREATE TABLE IF NOT EXISTS revisum_compatibility_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    migration_version INTEGER NOT NULL,
    previous_checksum BLOB,
    canonical_checksum BLOB NOT NULL,
    reason TEXT NOT NULL,
    backup_id TEXT NOT NULL,
    changed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE revisum_storage_compatibility (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    format_generation INTEGER NOT NULL,
    minimum_reader_generation INTEGER NOT NULL
);

INSERT INTO revisum_storage_compatibility
    (id, format_generation, minimum_reader_generation) VALUES (1, 1, 1);
