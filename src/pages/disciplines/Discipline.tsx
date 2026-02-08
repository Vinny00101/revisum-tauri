import { useState, useEffect, useCallback } from "react";
import {
    Filter,
    Plus,
    Search,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { mapDisciplineToResponse } from "@/service/mappers/DisciplineMapper";
import { DisciplineResponse } from "@/types/TypeInterface";
import { DataTable } from "@/components/tables/DataTables";
import { disciplineColumns } from "@/components/discipline/disciplinesColumns";
import { disciplineFilters, disciplineSearch } from "@/components/discipline/disciplineTool";
import { useSmartFilterSearch } from "@/components/tables/hooks/useBarTools";
import { get_all_discipline } from "@/tauri/discipline";
import ModalDisciplina from "./ModalDiscipline";
import { eventBus } from "@/util/Event";

export default function Discipline() {
    const [disciplines, setDisciplines] = useState<DisciplineResponse[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { showToast } = useToast();
    const { filter, search, setFilter, setSearch, processedData } = useSmartFilterSearch(disciplines, disciplineFilters, "all", disciplineSearch);

    const getAllDiscipline = useCallback(async () => {

        try {
            const result = await get_all_discipline();
            if (result.message.code && result.discipline) {
                const adapted = result.discipline.map(mapDisciplineToResponse);
                setDisciplines(adapted);

            } else {
                showToast({ type: "error", message: result.message.message });
                setDisciplines([])
            }
        } catch (err: any) {
            showToast({ type: "error", message: "Erro inesperado ao buscar disciplinas." });
            console.error("Discipline error:", err);
        }
    },[showToast]);

    useEffect(() => {
        getAllDiscipline();
        eventBus.on("discipline:updated", getAllDiscipline);

        return () => {
            eventBus.off("discipline:updated", getAllDiscipline);
        }
    }, [getAllDiscipline]);

    return (
        <div className="p-6">
            {/* Cabeçalho */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-800">Disciplinas</h1>
                    <div className="flex items-center gap-3">
                        {/* Botões de Ação em Lote 
                        {selectedRows.length > 0 && (
                            <div className="flex items-center gap-2 mr-4">
                                <span className="text-sm text-gray-600">
                                    {selectedRows.length} selecionado(s)
                                </span>
                                <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                                    Exportar
                                </button>
                                <button className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                                    Excluir
                                </button>
                            </div>
                        )}
                        */}
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <Plus size={20} />
                            Nova Disciplina
                        </button>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Pesquisa */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Pesquisar disciplinas..."
                            value={search}
                            className="w-full pl-10 pr-4 py-2.5 model-input"
                            onChange={(e) => setSearch(e.target.value as any)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                            className="px-4 py-2.5 model-input"
                        >
                            {disciplineFilters.map((filterOption) => (
                                <option key={filterOption.key} value={filterOption.key}>
                                    {filterOption.label}
                                </option>
                            ))}
                        </select>
                        <button className="px-4 py-2.5 border model-input flex items-center gap-2">
                            <Filter size={18} />
                            Mais filtros
                        </button>
                    </div>
                </div>
            </div>

            <DataTable
                data={processedData}
                columns={disciplineColumns}
                pageSize={5}
            />

            <ModalDisciplina
                title="Nova Disciplina"
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                reloadTable={getAllDiscipline}
            />
        </div>
    );
}