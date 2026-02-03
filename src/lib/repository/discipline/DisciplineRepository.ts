import Discipline from "@/lib/models/Discipline";
import Database from "@tauri-apps/plugin-sql";
import { RowMapper } from "../RowMapper";
import BaseRepository from "../Baserepository";


export default class DisciplineRepository extends BaseRepository<Discipline> {
    public static readonly discipline_post_sql: string = "INSERT INTO discipline (user_id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)";
    //public static readonly discipline_put_sql: string = "UPDATE discipline SET name = ?, description = ?, updated_at = ? WHERE id = ? AND user_id = ?";
    //public static readonly discipline_delete_sql: string = "DELETE FROM discipline WHERE id = ? AND user_id = ?";
    public static readonly discipline_get_sql: string = "SELECT * FROM discipline WHERE id = ? AND user_id = ?";
    private static readonly discipline_getAll_sql: string = "SELECT * FROM discipline WHERE user_id = ? ORDER BY created_at DESC";
    public static readonly discipline_exists_name_sql: string = "SELECT 1 FROM discipline WHERE user_id = ? AND name = ? LIMIT 1";
    public static readonly discipline_exists_sql: string = "SELECT 1 FROM discipline WHERE user_id = ? AND id = ? LIMIT 1";

    constructor(private readonly db: Database) {
        super();
    }

    private readonly mapper: RowMapper<Discipline> = (row) => Discipline.create(
        row.id,
        row.user_id,
        row.name,
        row.description,
        row.created_at,
        row.updated_at
    );

    async createDiscipline(
        user_id: number,
        name: string,
        description?: string | null,
    ): Promise<Boolean> {
        const now = new Date().toISOString();

        const result = await this.execute(
            this.db,
            DisciplineRepository.discipline_post_sql,
            user_id,
            name,
            description ?? null,
            now,
            now
        )

        if (!result.lastInsertId){
            return false;
        }
        return true;
    }

    async getDiscipline(user_id: number, id: number): Promise<Discipline | null> {
        return this.queryOne(
            this.db,
            DisciplineRepository.discipline_get_sql,
            this.mapper,
            id,
            user_id
        );
    }

    async getAllDiscipline(user_id: number): Promise<Discipline[]>{
        return this.queryList(
            this.db,
            DisciplineRepository.discipline_getAll_sql,
            this.mapper,
            user_id
        )
    } 

    async existsNameDiscipline(user_id: number, name: string): Promise<Boolean> {
        const result = await this.db.select(
            DisciplineRepository.discipline_exists_name_sql,
            [
                user_id,
                name
            ]
        )as unknown[];

        return result.length > 0;
    }

    async existsById(user_id: number, id: number): Promise<Boolean> {
        const result = await this.db.select(
            DisciplineRepository.discipline_exists_sql,
            [
                user_id,
                id
            ]
        )as unknown[];

        return result.length > 0;
    }
}