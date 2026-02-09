export interface User {
    id: number;
    username: string;
    email: string;
    avatarPath: string | null;
    createdAt: string;
    updatedAt: string;
}


export interface Discipline {
    id: number,
    userId: number,
    name: string,
    description: string | null,
    createdAt: string,
    updatedAt: string
}

export interface Content {
    id: number;
    discipline_id: number;
    title: string;
    description: string | null;
    display_order: number;
    created_at: string;
    updated_at: string;
}