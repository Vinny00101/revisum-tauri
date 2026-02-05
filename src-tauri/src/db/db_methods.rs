use serde_json::Value as JsonValue;
use sqlx::{Error as SqlxError, FromRow, Sqlite, sqlite::SqliteRow};
use tauri::State;

use crate::{db::config::DbStore, error::app_error::AppError};



#[derive(Debug, Clone, serde::Serialize)]
pub struct ExecuteResult{
    pub rows_affected: u64,
    pub last_insert_id: i64,
}

// Helper interno para bind de JsonValue → sqlx
fn bind_value<'q>(
    q: sqlx::query::Query<'q, Sqlite, sqlx::sqlite::SqliteArguments<'q>>,
    value: JsonValue
) -> sqlx::query::Query<'q, Sqlite, sqlx::sqlite::SqliteArguments<'q>>{
    match value {
        JsonValue::Null => q.bind(None::<String>),
        JsonValue::Bool(b) => q.bind(b),
        JsonValue::Number(n) if n.is_i64() => q.bind(n.as_i64().unwrap()),
        JsonValue::Number(n) if n.is_u64() => q.bind(n.as_u64().unwrap() as i64),
        JsonValue::Number(n) => q.bind(n.as_f64().unwrap_or(0.0)),
        JsonValue::String(s) => q.bind(s),
        other => q.bind(other.to_string()),
    }
}

/*

Essa query é usada para executar todos os tipos de consultas em (INSERT, UPDATE, DELETE)
* Deve ser usada somente em repository.
* Primeira linha prepara a query.
* o for chama o bind_value para estrutura a query com os valores da função.

* returns são as linhas afetadas ou um novo id que foi inserido.
*/
pub async fn db_execute(
    state: &State<'_, DbStore>,
    query: &str,
    values: Vec<JsonValue>,
) -> Result<ExecuteResult, AppError>{
    let mut sql_query = sqlx::query(query);


    for value in values{
        sql_query = bind_value(sql_query, value);
    }

    let result = sql_query
        .execute(&state.pool)
        .await
        .map_err(| e| AppError::DatabaseMethods(format!("Falha ao executar {}", e)))?;

    Ok(ExecuteResult {
        rows_affected: result.rows_affected(),
        last_insert_id: result.last_insert_rowid()
    }) 
}

/*
Select many (retorna Vec<T>)
*/
pub async fn db_select_many<T>(
    state: &State<'_, DbStore>,
    query: &str,
    values: Vec<JsonValue>,
) -> Result<Vec<T>, AppError>
where
    T: for<'r> FromRow<'r, SqliteRow> + Unpin + Send + 'static,
{
    let mut sql_query = sqlx::query(query);

    for value in values {
        sql_query = bind_value(sql_query, value);
    }

    let rows = sql_query
        .fetch_all(&state.pool)
        .await
        .map_err(|e| AppError::DatabaseMethods(format!("Falha ao selecionar múltiplos: {}", e)))?;

    let items: Vec<T> = rows
        .into_iter()
        .map(|row| T::from_row(&row)).collect::<Result<_, SqlxError>>()
        .map_err(|e| AppError::DatabaseMethods(format!("Falha ao mapear rows: {}", e)))?;

    Ok(items)
}

/*
 Select one (retorna Option<T>)
*/
pub async fn db_select_one<T>(
    state: &State<'_, DbStore>,
    query: &str,
    values: Vec<JsonValue>,
) -> Result<Option<T>, AppError> 
where 
    T: for<'r> FromRow<'r, SqliteRow> + Unpin + Send + 'static,
{
    let mut sql_query = sqlx::query(query);

    for value in values{
        sql_query = bind_value(sql_query, value);
    }

    let row_opt = sql_query
        .fetch_optional(&state.pool)
        .await
        .map_err(|e| AppError::DatabaseMethods(format!("Falha ao selecionar um: {}", e)))?;

    match row_opt {
        Some(row) => {
            let item = T::from_row(&row)
                .map_err(|e| AppError::DatabaseMethods(format!("Falha ao mapear row: {}", e)))?;
            Ok(Some(item))
        }
        None => Ok(None),
    }
}


pub async fn db_close(state: &State<'_, DbStore>) -> Result<(), AppError> {
    let _ = state.pool.close().await;
    Ok(())
}