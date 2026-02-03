import { Breadcrumb } from "@/components/dashboard/Breadcrumb";
import ActionButtons from "@/components/discipline/ActionButtons";
import ProgressBar from "@/components/discipline/Progress";
import StatusBadge from "@/components/discipline/StatusBadge";
import { useTauri } from "@/context/TauriContext";
import { useToast } from "@/context/ToastContext";
import { mapDisciplineToResponse } from "@/service/mappers/DisciplineMapper";
import { DisciplineResponse } from "@/types/TypeInterface";
import { number } from "framer-motion";
import { BarChart3, BookOpen, Calendar, Edit, FileText, Filter, MoreVertical, Plus, Search, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function DisciplineDetail() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { discService } = useTauri();
    const [discipline, setDiscipline] = useState<DisciplineResponse>();
    const { id } = useParams();

    // precisa ser implementado algumas coisas que estão aqui em baixo, e uma refatoracção do codigo de disciplina.
    const [loading, setLoading] = useState(true);
    const [isCreateItemModalOpen, setIsCreateItemModalOpen] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState<keyof any>("createdAt");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

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
            const discipline = await discService.getDiscipline(id_number);

            if (!discipline.listDisc) {
                showToast({
                    type: "error",
                    message: "Não existe uma disciplina com esse identificador único.",
                });
                navigate("/disciplines");
                return;
            }

            setDiscipline(mapDisciplineToResponse(discipline.listDisc));
        } catch {
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

    const handleDelete = async () => {
        try {
            //const result = await discService.deleteDiscipline(parseInt(id!));
            /*
            if (result.message.code) {
                showToast({ type: "success", message: "Disciplina excluída com sucesso" });
                navigate("/disciplines");
            }
                */
            showToast({ type: "info", message: "Deletar em desenvolvimento" });
        } catch (err) {
            showToast({ type: "error", message: "Erro ao excluir disciplina" });
        }
    };

    const handleExport = () => {
        // Implementar lógica de exportação
        showToast({ type: "info", message: "Exportação em desenvolvimento" });
    };

    const handleToggleFavorite = async () => {
        if (!discipline) return;

        try {
            // em breve.

            /*
            if (result.message.code) {
                setDiscipline({
                    ...discipline,
                    favorite: !discipline.favorite
                });
                showToast({
                    type: "success",
                    message: discipline.favorite 
                        ? "Removida dos favoritos" 
                        : "Adicionada aos favoritos"
                });
            }
            */
            showToast({ type: "info", message: "Favorito em desenvolvimento" });
        } catch (err) {
            showToast({ type: "error", message: "Erro ao atualizar favorito" });
        }
    };

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
                                                progress={discipline.progress}
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
                                            onToggleFavorite={handleToggleFavorite}
                                            onDelete={handleDelete}
                                            onExport={handleExport}
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
                                <select className="px-4 py-2.5 model-input">
                                    <option>Todos os tipos</option>
                                    <option>Cards</option>
                                    <option>Questões</option>
                                    <option>Material</option>
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
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="w-12 px-6 py-3 text-left">
                                        <input type="checkbox" className="rounded border-gray-300" />
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                        título
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                        descrição
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                        ordem de exibição
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                        Criado em
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                        atualizado em
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {items.length > 0 ? (
                                    items.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300"
                                                    onChange={() => {/* handle select */ }}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-gray-900">
                                                    {item.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button className="p-1.5 text-gray-600 hover:bg-gray-50 rounded">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="text-gray-500">
                                                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                                <p>Nenhum conteúdo encontrado</p>
                                                <p className="text-sm mt-1">
                                                    Comece criando seu primeiro conteúdo
                                                </p>
                                                <button
                                                    onClick={() => setIsCreateItemModalOpen(true)}
                                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                >
                                                    Criar Primeiro conteúdo
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
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
        </div>
    );
}
