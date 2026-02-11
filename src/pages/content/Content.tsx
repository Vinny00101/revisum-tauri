import { Plus } from "lucide-react";
import { useState } from "react";
import ModalStudyItem from "../studyItem/ModalStudyItem";
import { useParams } from "react-router-dom";
import { number } from "framer-motion";


export default function Context() {
    const { id } = useParams();
    const [isCreateStudyItem, setIsCreateStudyItem] = useState(false);

    return (
        <div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">
                                Itens de estudos do conteúdo da disciplina.
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Gerencie os itens de estudos do conteúdos desta disciplina.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {/*
                                {selectedItems.length > 0 && (
                                    <div className="flex items-center gap-2 mr-4">
                                        <span className="text-sm text-gray-600">
                                            {selectedItems.length} selecionado(s)
                                        </span>
                                        <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                                            Exportar seleção
                                        </button>
                                        <button className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                                            Excluir seleção
                                        </button>
                                    </div>
                                )}

                                */}

                            <button
                                onClick={() => setIsCreateStudyItem(true)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                            >
                                <Plus size={20} />
                                Novo item de estudo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <ModalStudyItem
            contentId={number.parse(id!)}
            onClose={() => setIsCreateStudyItem(false)}
            isOpen={isCreateStudyItem}
            reload={() => {}}
            />
        </div>
    );
}