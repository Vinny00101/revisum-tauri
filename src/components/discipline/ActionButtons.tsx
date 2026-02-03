import { Edit, Play, MoreVertical, Trash2, Download, Star } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ActionButtonsProps {
    disciplineId: number;
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
    onDelete?: () => void;
    onExport?: () => void;
}

export default function ActionButtons({
    disciplineId,
    isFavorite = false,
    onToggleFavorite,
    onDelete,
    onExport
}: ActionButtonsProps) {
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleStudy = () => {
        navigate(`/study/session?discipline=${disciplineId}`);
    };

    const handleEdit = () => {
        navigate(`/disciplines/${disciplineId}/edit`);
    };

    return (
        <div className="flex items-center justify-center gap-2">
            {/* Botão de Estudar */}
            <button
                onClick={handleStudy}
                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                title="Estudar"
            >
                <Play size={18} />
            </button>

            {/* Botão de Editar */}
            <button
                onClick={handleEdit}
                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                title="Editar"
            >
                <Edit size={18} />
            </button>

            {/* Botão de Favorito */}
            {onToggleFavorite && (
                <button
                    onClick={onToggleFavorite}
                    className={`p-2 rounded-lg transition-colors ${isFavorite
                        ? "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                >
                    <Star size={18} className={isFavorite ? "fill-yellow-400" : ""} />
                </button>
            )}

            {/* Dropdown de Mais Opções */}
            <div className="relative">
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Mais opções"
                >
                    <MoreVertical size={18} />
                </button>

                {showDropdown && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowDropdown(false)}
                        />
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                            <div className="py-1">
                                {onExport && (
                                    <button
                                        onClick={() => {
                                            onExport();
                                            setShowDropdown(false);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                        <Download size={16} />
                                        Exportar dados
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        onClick={() => {
                                            onDelete();
                                            setShowDropdown(false);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <Trash2 size={16} />
                                        Excluir disciplina
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}