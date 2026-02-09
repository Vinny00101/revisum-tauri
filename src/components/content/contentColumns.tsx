import { Column, ContentResponse } from "@/types/TypeInterface";
import { File } from "lucide-react";
import { NavLink } from "react-router-dom";

export const contentColumns: Column<ContentResponse>[] = [
    {
        key: "title",
        header: "Título",
        sortable: true,
        render: (content) => (
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <File size={20} />
                </div>

                <div className="min-w-0 flex-1">
                    <NavLink
                        to={`/disciplines/${content.id}`}
                        state={{ breadcrumbName: content.title }}
                        className="group block"
                    >
                        <div className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-200 line-clamp-1">
                            {content.title}
                        </div>
                        {content.description && (
                            <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {content.description}
                            </div>
                        )}
                    </NavLink>
                </div>
            </div>
        )
    },
    {
        key: "description",
        header: "Descrição",
        sortable: false,
        render: (content) => (
            <div className="max-w-xs">
                <div className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                    {content.description || (
                        <span className="text-gray-400 italic">Sem descrição</span>
                    )}
                </div>
            </div>
        )
    },
    {
        key: "display_order",
        header: "Ordem de Exibição",
        sortable: true,
        render: (content) => (
            <div className="flex justify-center">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-100 shadow-sm">
                    {content.display_order}
                </span>
            </div>
        )
    },
    {
        key: "created_at",
        header: "Criado em",
        render: (content) => (
            <div>
                <div className="text-sm font-medium text-gray-500">
                    {content.created_at ? (
                        content.created_at
                    ) : (
                        "Nunca estudado"
                    )}
                </div>
            </div>
        )
    },
    {
        key: "updated_at",
        header: "Atualizado em",
        render: (content) => (
            <div>
                <div className="text-sm font-medium text-gray-500">
                    {content.updated_at ? (
                        content.updated_at
                    ) : (
                        <span className="text-gray-400">Não atualizado</span>
                    )}
                </div>
            </div>
        )
    },
    {
        key: "actions",
        header: "Ações",
        render: () => (
            <div className="flex justify-center">
                <span className="text-sm text-gray-400 italic">
                    Em breve...
                </span>
            </div>
        )
    }
];