import Discipline from "@/lib/models/Discipline";
import { DisciplineResponse } from "@/types/TypeInterface";

export function mapDisciplineToResponse(
    discipline: Discipline
): DisciplineResponse {

    return {
        id: discipline.id,
        name: discipline.name,
        description: discipline.description ?? "",
        itemCount: 0,
        cardCount: 0,
        questionCount: 0,
        progress: 0,
        lastStudied: null,
        favorite: false,
        createdAt: new Date(discipline.createdAt).toISOString(),
    };
}
