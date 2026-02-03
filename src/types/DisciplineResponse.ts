export interface DisciplineResponse {
    id: number;
    name: string;
    description: string;
    itemCount: number;
    cardCount: number;
    questionCount: number;
    progress: number;
    lastStudied: string | null;
    createdAt: string;
    favorite: boolean;
}