import { contentColumns } from "../components/content/contentColumns";
import { Breadcrumb } from "@/components/dashboard/Breadcrumb";
import ActionButtons from "../components/discipline/ActionButtons";
import ProgressBar from "../components/discipline/Progress";
import { DataTable } from "@/components/tables/DataTables";
import { useSmartFilterSearch } from "@/components/tables/hooks/useBarTools";
import { useToast } from "@/context/ToastContext";
import { number } from "framer-motion";
import { BookOpen, Calendar, FileText, Filter, Plus, Search } from "lucide-react";
import { useEffect,useCallback, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { contentFilters, contentSearch } from "../components/content/contentTool";
import { get_discipline } from "@/tauri/discipline";
import { ModalDisciplina } from "../components/ModalDiscipline";
import { ModalContent } from "../components/ModalContent";
import { get_all_content } from "../../../tauri/content";
import { Content, Discipline } from "../types/interfaces";
import { eventBus } from "@/util/Event";


export function DisciplineDetail() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { id } = useParams();
    const [discipline, setDiscipline] = useState<Discipline>();
    const [contents, setContents] = useState<Content[]>([]);
    const [isCreateContentModalOpen, setIsCreateContentModalOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const getContents = useCallback( async (id_number: number) => {
        try {
            const result = await get_all_content(id_number);
            if (!result.message.code || !result.content) {
                showToast({
                    type: "error",
                    message: result.message.message
                })
            } else {
                const adapted = result.content;
                setContents(adapted);
            }
        } catch (err: any) {
            showToast({
                type: "error",
                message: "Erro no rust",
            });
        }
    }, []);

    const getDiscipline = useCallback(async () => {
        setIsLoading(true);
        try {
            const id_number = Number(id);
            const discipline = await get_discipline(id_number);

            if (!discipline.discipline) {
                showToast({
                    type: "error",
                    message: "Não existe uma disciplina com esse identificador único.",
                });
                navigate("/disciplines");
                return;
            }

            getContents(id_number);

            setDiscipline(discipline.discipline);
        } catch (err: any) {
            navigate("/disciplines");
            showToast({
                type: "error",
                message: "O identificador único da disciplina deve ser um número:" + err,
            });
        }finally{
            setIsLoading(false);
        }
    }, [id, getContents]);

    useEffect(() => {
        getDiscipline();

        eventBus.on("content:updated", getDiscipline);

        return () => {
            eventBus.off("content:updated", getDiscipline);
        };
    }, [getDiscipline]);

    const { filter, search, setFilter, setSearch, processedData } = useSmartFilterSearch(contents, contentFilters, "all", contentSearch);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 animate-pulse">Carregando conteúdos...</p>
            </div>
        );
    }

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
                                            isShowDropdown={false}
                                            onAction={(action, id) => {
                                                if (action === "edit") setEditId(id);
                                            }}
                                        >
                                            <ModalDisciplina
                                                id={editId ?? undefined}
                                                title="Editar Disciplina"
                                                isOpen={editId === discipline.id}
                                                onClose={() => setEditId(null)}
                                                reloadTable={getDiscipline}
                                            />
                                        </ActionButtons>
                                    </div>
                                </div>
                                {/* Estatísticas Rápidas, Barra de Progresso, Botões de Ação */}
                                <div className="w-full flex-wrap mt-6 border-t-2 border-gray-200">
                                    <div className="flex mt-6 flex-wrap gap-6">
                                        {/*<div className="flex items-center gap-2">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <BookOpen size={35} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Cards</p>
                                                <p className="font-semibold text-gray-800">
                                                    {discipline.cardCount}
                                                </p>
                                            </div>
                                        </div>*/}
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-green-50 rounded-lg">
                                                <FileText size={35} className="text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Total de itens</p>
                                                <p className="font-semibold text-gray-800">
                                                    {discipline.total_items}
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
                                                    {discipline.last_review_date
                                                        ? new Date(discipline.last_review_date).toLocaleDateString('pt-BR')
                                                        : 'Nunca'
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <p>Progresso de revisão</p>
                                            <ProgressBar progress={discipline.progress_percent} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Seção de Itens */}
                <div className="space-y-6">
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
                                        onClick={() => setIsCreateContentModalOpen(true)}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                                    >
                                        <Plus size={20} />
                                        Novo conteúdo
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Ferramentas de Filtro e Busca */}
                        <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-b-xl">
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
                    </div>

                    {/* Lista de Itens */}
                    <div className="overflow-x-auto">
                        <DataTable
                            labelFooter="Conteúdos"
                            data={processedData}
                            columns={contentColumns}
                            pageSize={7}
                        />
                    </div>
                </div>
            </div>
            <ModalContent
                disciplineId={number.parse(id!)}
                title="Criar conteúdo"
                isOpen={isCreateContentModalOpen}
                onClose={() => setIsCreateContentModalOpen(false)}
                reloadTable={getDiscipline}
            />

            <Outlet />
        </div>
    );
}
