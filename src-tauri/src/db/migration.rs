use tauri_plugin_sql::{Migration, MigrationKind};

pub fn migrations() -> Vec<Migration> {
    vec![Migration {
        version: 1,
        description: "init_database",
        sql: include_str!("../migrations/V1_create_tables.sql"),
        kind: MigrationKind::Up,
    }]
}
