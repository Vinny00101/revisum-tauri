import Database from "@tauri-apps/plugin-sql";
import { RowMapper } from "./RowMapper";

export default abstract class BaseRepository<T> {
  protected async queryOne(
    db: Database,
    sql: string,
    mapper: RowMapper<T>,
    ...params: any[]
  ): Promise<T | null> {
    const result = await db.select<Record<string, any>>(sql, params);
    if (result.length === 0) return null;
    return mapper(result[0]);
  }
}
