import { Column } from "@/types/interfaces";
import { StudyItemType } from "@/types/types";
import { FileText, HelpCircle } from "lucide-react";
import { StudyItemFullResponse } from "../../types/interfaces";

export const studyItemColumns: Column<StudyItemFullResponse>[] = [
    {
        key: "item_type",
        header: "Tipo",
        sortable: true,
        render: (item) => (
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    {item.item_type === StudyItemType.CARD ? (
                        <FileText size={16} />
                    ) : (
                        <HelpCircle size={16} />
                    )}
                </div>
                <span className="font-medium">
                    {item.item_type === StudyItemType.CARD ? "Card" : "Questão"}
                </span>
            </div>
        ),
    },

    {
        key: "preview",
        header: "Conteúdo",
        sortable: false,
        render: (item) => {
            if (item.item_type === StudyItemType.CARD && item.card) {
                return (
                    <div className="line-clamp-2 text-gray-800">
                        {item.card.front}
                    </div>
                );
            }

            if (item.item_type === StudyItemType.QUESTION && item.question) {
                return (
                    <div className="line-clamp-2 text-gray-800">
                        {item.question.question.statement_text}
                    </div>
                );
            }

            return <span className="text-gray-400 italic">—</span>;
        },
    },

    {
        key: "updated_at",
        header: "Atualizado em",
        sortable: true,
        render: (item) => (
            <div>
                <div className="text-sm font-medium text-gray-500">
                    {item.updated_at ? (
                        new Date(item.updated_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
                    ) : (
                        <span className="text-gray-400">Não atualizado</span>
                    )}
                </div>
            </div>
        ),
    },
    {
        key: "created_at",
        header: "Criado em",
        sortable: true,
        render: (item) => (
            <div>
                <div className="text-sm font-medium text-gray-500">
                    {new Date(item.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                </div>
            </div>
        )

    },
    {
        key: "actions",
        header: "Ações",
        render: () => {

        }
    }
]