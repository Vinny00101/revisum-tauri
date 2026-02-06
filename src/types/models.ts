export interface User{
    id: number,
    username: string,
    email: string,
    passwordHash: string,
    avatarPath: string | null,
    createdAt: Date,
    updatedAt: Date
}