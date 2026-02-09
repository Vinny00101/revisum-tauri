import { Content } from "@/types/models";
import { ContentResponse } from "@/types/TypeInterface";

export function mapContentToResponse(
    content: Content
): ContentResponse {

    return {
        id: content.id,
        discipline_id: content.discipline_id,
        title: content.title,
        description: content.description ?? "",
        display_order: content.display_order,
        created_at: new Date(content.created_at).toLocaleString("pt-BR",{dateStyle: "short", timeStyle: "short"}),
        updated_at: new Date(content.updated_at).toLocaleString("pt-BR",{dateStyle: "short", timeStyle: "short"}),
    };
}
