import { DisciplineRes } from "@/types/models";
import { DisciplineResponse } from "@/types/TypeInterface";

export function mapDisciplineToResponse(
    discipline: DisciplineRes
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
        createdAt: discipline.createdAt,
    };
}
