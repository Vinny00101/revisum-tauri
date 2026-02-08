import { contentColumns } from "@/components/content/contentColumns";
import { Breadcrumb } from "@/components/dashboard/Breadcrumb";
import ActionButtons from "@/components/discipline/ActionButtons";
import ProgressBar from "@/components/discipline/Progress";
import StatusBadge from "@/components/discipline/StatusBadge";
import { DataTable } from "@/components/tables/DataTables";
import { useSmartFilterSearch } from "@/components/tables/hooks/useBarTools";
import { useToast } from "@/context/ToastContext";
import { mapDisciplineToResponse } from "@/service/mappers/DisciplineMapper";
import { DisciplineResponse } from "@/types/TypeInterface";
import { number } from "framer-motion";
import { BarChart3, BookOpen, Calendar, FileText, Filter, Plus, Search, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ContentResponse } from "@/types/TypeInterface";
import { contentFilters, contentSearch } from "@/components/content/contentTool";
import { get_discipline } from "@/tauri/discipline";
import { DisciplineAction } from "@/types/types";
import ModalDisciplina from "./ModalDiscipline";

export default function DisciplineDetail() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { id } = useParams();
    const [discipline, setDiscipline] = useState<DisciplineResponse>();
    const [contents, setContents] = useState<ContentResponse[]>([]);
    const [isCreateItemModalOpen, setIsCreateItemModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { filter, search, setFilter, setSearch, processedData } = useSmartFilterSearch(contents, contentFilters, "all", contentSearch);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const handleDisciplineAction = (action: DisciplineAction, id: number) => {
        switch (action) {
            case "study":
                navigate(`/study/session?discipline=${id}`);
                break;

            case "edit":
                setIsEditModalOpen(true);
                break;

            case "delete":
                //
                break;

            case "export":
                break;

            case "toggle_favorite":
                break;
        }
    };


    const getDiscipline = async () => {
        try {
            if (!id) {
                showToast({
                    type: "error",
                    message: "O identificador único não existe no parâmetro da url.",
                });
                navigate("/disciplines");
                return;
            }
            const id_number = number.parse(id);
            const discipline = await get_discipline(id_number);

            if (!discipline.discipline) {
                showToast({
                    type: "error",
                    message: "Não existe uma disciplina com esse identificador único.",
                });
                navigate("/disciplines");
                return;
            }

            setDiscipline(mapDisciplineToResponse(discipline.discipline!));
        } catch (err: any) {
            navigate("/disciplines");
            showToast({
                type: "error",
                message: "O identificador único da disciplina deve ser um número.",
            });
        }
    };

    useEffect(() => {
        getDiscipline();
    }, []);

    if (!discipline) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Disciplina não encontrada
                    </h3>
                    <button
                        onClick={() => navigate("/disciplines")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Voltar para Disciplinas
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Breadcrumb />

            <div className="space-y-6">
                {/* Cabeçalho */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm p-6">
                    <div className="flex p-6">
                        <div className="flex items-start justify-between mb-4 w-full">
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <div className="gap-2">
                                        <div className="flex items-center gap-3 mb-3">
                                            <h1 className="text-2xl font-bold text-gray-800">
                                                {discipline.name}
                                            </h1>
                                            {discipline.favorite && (
                                                <span className="text-yellow-500">
                                                    <Star className="fill-yellow-400" size={20} />
                                                </span>
                                            )}
                                            <StatusBadge
                                                lastStudied={discipline.lastStudied}
                                            />
                                        </div>

                                        {discipline.description && (
                                            <div className="mb-4">
                                                <p className="text-gray-600">{discipline.description}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-start justify-end gap-2">
                                        <ActionButtons
                                            disciplineId={discipline.id}
                                            isFavorite={discipline.favorite}
                                            onAction={handleDisciplineAction}
                                        />
                                    </div>
                                </div>
                                {/* Estatísticas Rápidas, Barra de Progresso, Botões de Ação */}
                                <div className="w-full flex-wrap mt-6 border-t-2 border-gray-200">
                                    <div className="flex mt-6 flex-wrap gap-6">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <BookOpen size={35} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Cards</p>
                                                <p className="font-semibold text-gray-800">
                                                    {discipline.cardCount}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-green-50 rounded-lg">
                                                <FileText size={35} className="text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Questões</p>
                                                <p className="font-semibold text-gray-800">
                                                    {discipline.questionCount}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-purple-50 rounded-lg">
                                                <Calendar size={35} className="text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Último estudo</p>
                                                <p className="font-semibold text-gray-800">
                                                    {discipline.lastStudied
                                                        ? new Date(discipline.lastStudied).toLocaleDateString('pt-BR')
                                                        : 'Nunca'
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <p>Progresso de revisão</p>
                                            <ProgressBar progress={discipline.progress} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Seção de Itens */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">
                                    Conteúdos da Disciplina
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Gerencie os conteúdos desta disciplina.
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
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

                                <button
                                    onClick={() => setIsCreateItemModalOpen(true)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                                >
                                    <Plus size={20} />
                                    Novo conteúdo
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Ferramentas de Filtro e Busca */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Buscar conteúdos..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 model-input"
                                />
                            </div>

                            <div className="flex gap-3">
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value as any)}
                                    className="px-4 py-2.5 model-input"
                                >
                                    {contentFilters.map((filterOption) => (
                                        <option key={filterOption.key} value={filterOption.key}>
                                            {filterOption.label}
                                        </option>
                                    ))}
                                </select>

                                <button className="px-4 py-2.5 model-input flex items-center gap-2">
                                    <Filter size={18} />
                                    Filtros
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Lista de Itens */}
                    <div className="overflow-x-auto">
                        <DataTable
                            data={processedData}
                            columns={contentColumns}
                            pageSize={7}
                        />
                    </div>
                </div>

                {/* Estatísticas Detalhadas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 className=" font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <BarChart3 size={20} />
                            Estatísticas de Estudo
                        </h3>
                        <p className="text-sm mb-4 text-gray-500">Esta seção ainda tá em desenvolvimento.(Dados ilustrativo).</p>
                        {/* Ainda vai ser feito a logica disso aqui mais tarde. */}
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Tempo total de estudo</p>
                                <p className="text-lg font-semibold text-gray-800">4h 32m</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Sessões realizadas</p>
                                <p className="text-lg font-semibold text-gray-800">12</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Taxa de acerto</p>
                                <p className="text-lg font-semibold text-gray-800">78%</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Calendar size={20} />
                            Próximas Revisões
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-800">Cards atrasados</p>
                                    <p className="text-sm text-gray-500">Devem ser revisados hoje</p>
                                </div>
                                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                    12
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-800">Próximas revisões</p>
                                    <p className="text-sm text-gray-500">Nos próximos 7 dias</p>
                                </div>
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                                    24
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ModalDisciplina
                title="Editar disciplina"
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                reloadTable={getDiscipline}
            />
        </div>
    );
}
