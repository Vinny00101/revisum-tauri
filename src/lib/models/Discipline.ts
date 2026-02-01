import BaseEntity from "./BaseEntity";

export default class Discipline extends BaseEntity {
    public readonly userId: number;
    public readonly name: string;
    public readonly description: string | null;

    private constructor(
        id: number,
        userId: number,
        name: string,
        description: string | null,
        createdAt: Date,
        updatedAt: Date
    ) {
        super(id, createdAt, updatedAt);
        this.userId = userId;
        this.name = name;
        this.description = description;
    }

    static create(
        id: number,
        userId: number,
        name: string,
        description: string | null,
        createdAt: Date,
        updatedAt: Date
    ): Discipline {
        return new Discipline(
            id,
            userId,
            name,
            description,
            createdAt,
            updatedAt
        );
    }
}
