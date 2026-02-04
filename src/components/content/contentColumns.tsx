import { Column, ContentResponse } from "@/types/TypeInterface";
import { File } from "lucide-react";
import { NavLink } from "react-router-dom";


export const contentColumns: Column<ContentResponse>[] = [
    {
        key: "title",
        header: "Título",
        sortable: true,
        render: (content) => (
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <File size={20} />
                </div>

                <div>
                    <div className="flex items-center gap-2">
                        <NavLink
                            to={`/disciplines/${content.id}`}
                            state={{ breadcrumbName: content.title }}
                            className="font-medium text-gray-900 hover:text-blue-600"
                        >
                            {content.title}
                        </NavLink>
                    </div>
                </div>
            </div>
        )
    },
    {
        key: "description",
        header: "Descrição",
        sortable: false,
        render: (content) => (
            <div className="text-start">
                <div className="text-xs text-gray-500">{content.description}</div>
            </div>
        )
    },
    {
        key: "display_order",
        header: "Ordem de exibição",
        sortable: true,
        render: (content) => (
            <div className="text-start">
                <span className="font-semibold text-gray-800">
                    {content.display_order}
                </span>
            </div>
        )
    },
    {
        key: "created_at",
        header: "Criado em",
        render: (content) => (
            <div className="text-start">
                <span className="text-sm text-gray-700">
                  {content.created_at ?? "Nunca estudado"}
                </span>
            </div>
        )
    },
    {
        key: "updated_at",
        header: "Atualizado em",
        render: (content) => (
            <div className="text-start">
                <span className="text-sm text-gray-700">
                  {content.created_at ?? "Nunca estudado"}
                </span>
            </div>
        )
    },
    {
        key: "actions",
        header: "Ações",
        render: () => (
            <div className="text-start">
                nenhuma ação ainda.
            </div>
        )
    }


]