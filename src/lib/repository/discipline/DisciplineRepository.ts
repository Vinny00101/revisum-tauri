import Discipline from "@/lib/models/Discipline";
import BaseRepository from "../Baserepository";
import Database from "@tauri-apps/plugin-sql";
import { RowMapper } from "../RowMapper";


export default class DisciplineRepository extends BaseRepository<Discipline> {
    public static readonly discipline_post_sql: string = "INSERT INTO discipline (user_id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)";
    //public static readonly discipline_put_sql: string = "UPDATE discipline SET name = ?, description = ?, updated_at = ? WHERE id = ? AND user_id = ?";
    //public static readonly discipline_delete_sql: string = "DELETE FROM discipline WHERE id = ? AND user_id = ?";
    public static readonly discipline_get_sql: string = "SELECT * FROM discipline WHERE id = ? AND user_id = ?";
    //private static readonly discipline_getAll_sql: string = "SELECT * FROM discipline WHERE user_id = ? ORDER BY created_at DESC";
    //public static readonly discipline_exists_sql: string = "SELECT 1 FROM discipline WHERE user_id = ? AND name = ? LIMIT 1";

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
        name: number,
        description?: string | null,
    ): Promise<void> {
        const now = new Date().toISOString();

        const result = await this.db.execute(
            DisciplineRepository.discipline_post_sql,
            [
                user_id,
                name,
                description ?? null,
                now,
                now
            ]
        );

        const id = result.lastInsertId;
        if (!id) {
            throw new Error("Falha ao criar usuário, nenhum ID retornado.");
        }
    }

    async getDiscipline(id: number, user_id: number): Promise<Discipline | null> {
        return this.queryOne(
            this.db,
            DisciplineRepository.discipline_get_sql,
            this.mapper,
            id,
            user_id
        );
    }



}