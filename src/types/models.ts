export interface User{
    id: number,
    username: string,
    email: string,
    avatarPath: string | null,
    createdAt: Date,
    updatedAt: Date
}