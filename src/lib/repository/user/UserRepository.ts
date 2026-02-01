import Database from "@tauri-apps/plugin-sql";
import User from "@/lib/models/User";
import BaseRepository from "../Baserepository";
import { RowMapper } from "../RowMapper";

export default class UserRepository extends BaseRepository<User> {
    private static readonly SQL_INSERT =
        `INSERT INTO user 
      (username, email, password, avatar_path, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`;

    private static readonly VALIDATE_USERNAME =
        `SELECT * FROM user WHERE username = ? LIMIT 1`;

    private static readonly VALIDATE_EMAIL =
        `SELECT * FROM user WHERE email = ? LIMIT 1`;

    private static readonly EXISTS_ID =
        `SELECT 1 FROM user WHERE id = ? LIMIT 1`;

    private readonly mapper: RowMapper<User> = (row) =>
        User.create(
            row.id,
            row.username,
            row.email,
            row.password,
            row.avatar_path,
            new Date(row.created_at),
            new Date(row.updated_at)
        );

    constructor(private readonly db: Database) {
        super();
    }

    async createUser(
        username: string,
        email: string,
        passwordHash: string,
        avatarPath?: string | null
    ): Promise<void> {

        const now = new Date().toISOString();

        const result = await this.db.execute(
            UserRepository.SQL_INSERT,
            [
                username,
                email,
                passwordHash,
                avatarPath ?? null,
                now,
                now
            ]
        );

        const id = result.lastInsertId;
        if (!id) {
            throw new Error("Falha ao criar usuário, nenhum ID retornado.");
        }

        // provavelmente deve remover isso
        User.create(
            id,
            username,
            email,
            passwordHash,
            avatarPath ?? null,
            new Date(now),
            new Date(now)
        );
    }

    async verifyUser(username: string): Promise<User | null> {
        return this.queryOne(
            this.db,
            UserRepository.VALIDATE_USERNAME,
            this.mapper,
            username
        );
    }

    async verifyEmail(email: string): Promise<User | null> {
        return this.queryOne(
            this.db,
            UserRepository.VALIDATE_EMAIL,
            this.mapper,
            email
        );
    }

    async existsById(userId: number): Promise<boolean> {
        const result = await this.db.select(
            UserRepository.EXISTS_ID,
            [userId]
        )as unknown[];

        return result.length > 0;
    }

}