import { ContentAction } from "@/types/types";
import { Edit, Play, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ActionButtonsProps {
    contentid: number;
    onAction: (action: ContentAction, contentid: number) => void;
    children?: React.ReactNode;
}

export default function ActionButtons({
    contentid,
    onAction,
    children,
}: ActionButtonsProps) {
    const navigate = useNavigate();
    return (
        <div className="flex items-center gap-2">
            {/* Botão de Estudar */}
            <button
                onClick={
                    () => navigate(`/reviews/${contentid}`)
                }
                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                title="Estudar"
            >
                <Play size={18} />
            </button>

            <button
                onClick={() => onAction("edit", contentid)}
                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                title="Editar"
            >
                <Edit size={18} />
            </button>

            <button
                onClick={() => onAction("delete", contentid)}
                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                title="Excluir conteúdo"
            >
                <Trash2 size={18} />
            </button>

            {children}
            
        </div>
    );
}