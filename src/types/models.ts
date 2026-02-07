export interface User {
    id: number;
    username: string;
    email: string;
    avatarPath: string | null;
    createdAt: string;
    updatedAt: string;
}


export interface DisciplineRes {
    id: number,
    userId: number,
    name: string,
    description: string | null,
    createdAt: string,
    updatedAt: string
}