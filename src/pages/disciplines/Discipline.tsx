// src/pages/disciplines/List.tsx
import { useState, useMemo, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    Search,
    Filter,
    Plus,
    Edit,
    Play,
    Star,
    MoreVertical,
    ChevronDown,
    ChevronUp,
    BookOpen,
    Clock,
    BarChart3
} from "lucide-react";
import CreateDisciplineModal from "./CreateDisciplinesModal";
import { useTauri } from "@/context/TauriContext";
import { useToast } from "@/context/ToastContext";
import { mapDisciplineToResponse } from "@/service/mappers/DisciplineMapper";
import { DisciplineResponse } from "@/types/TypeInterface";

export default function Discipline() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [sortField, setSortField] = useState<keyof DisciplineResponse>("lastStudied");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [filter, setFilter] = useState<"all" | "favorites" | "needs-review">("all");

    const [disciplines, setDisciplines] = useState<DisciplineResponse[]>([]);
    const { showToast } = useToast();
    const { discService } = useTauri();
    const ITEMS_PER_PAGE = 5;
    const [currentPage, setCurrentPage] = useState(1);



    const getAllDiscipline = async () => {

        try {
            const result = await discService.getAllDiscipline();
            if (result.message.code && result.listDisc) {
                const adapted = result.listDisc.map(mapDisciplineToResponse);
                setDisciplines(adapted);

            } else {
                showToast({ type: "error", message: result.message.message });
                setDisciplines([])
            }
        } catch (err: any) {
            showToast({ type: "error", message: "Erro inesperado ao buscar disciplinas." });
            console.error("Discipline error:", err);
        }
    }

    useEffect(() => {
        getAllDiscipline();
    }, []);

    const filteredDisciplines = useMemo(() => {
        let result = [...disciplines];

        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(d =>
                d.name.toLowerCase().includes(searchLower) ||
                d.description.toLowerCase().includes(searchLower)
            );
        }

        // Aplicar filtro de tipo
        if (filter === "favorites") {
            result = result.filter(d => d.favorite);
        } else if (filter === "needs-review") {
            result = result.filter(d => d.progress < 70);
        }

        result.sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (aValue == null) return 1;
            if (bValue == null) return -1;

            if (
                sortField === "progress" ||
                sortField === "itemCount" ||
                sortField === "cardCount" ||
                sortField === "questionCount"
            ) {
                const numA = aValue as number;
                const numB = bValue as number;
                return sortDirection === "desc" ? numB - numA : numA - numB;
            }

            if (sortField === "name" || sortField === "description") {
                const strA = String(aValue).toLowerCase();
                const strB = String(bValue).toLowerCase();
                if (strA < strB) return sortDirection === "asc" ? -1 : 1;
                if (strA > strB) return sortDirection === "asc" ? 1 : -1;
                return 0;
            }

            if (sortField === "lastStudied" || sortField === "createdAt") {
                const dateA = aValue ? new Date(aValue as string).getTime() : 0;
                const dateB = bValue ? new Date(bValue as string).getTime() : 0;
                return sortDirection === "desc" ? dateB - dateA : dateA - dateB;
            }

            if (sortField === "favorite") {
                const boolA = aValue as boolean;
                const boolB = bValue as boolean;
                if (boolA === boolB) return 0;
                if (sortDirection === "desc") {
                    return boolA ? -1 : 1;
                } else {
                    return boolA ? 1 : -1;
                }
            }

            return 0;
        });

        return result;
    }, [disciplines, search, filter, sortField, sortDirection]);

    const totalItems = filteredDisciplines.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const paginatedDisciplines = filteredDisciplines.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const goToPrevious = () => {
        setCurrentPage((p) => Math.max(1, p - 1));
    };

    const goToNext = () => {
        setCurrentPage((p) => Math.min(totalPages, p + 1));
    };

    const goToPage = (page: number) => {
        setCurrentPage(page);
    };


    // Manipular seleção
    const handleSelectAll = () => {
        if (selectedRows.length === filteredDisciplines.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(filteredDisciplines.map(d => d.id));
        }
    };

    const handleSelectRow = (id: number) => {
        setSelectedRows(prev =>
            prev.includes(id)
                ? prev.filter(rowId => rowId !== id)
                : [...prev, id]
        );
    };

    // Manipular ordenação
    const handleSort = (field: keyof DisciplineResponse) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
    };

    // Formatar data
    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Nunca estudado";

        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Hoje";
        if (diffDays === 1) return "Ontem";
        if (diffDays < 7) return `${diffDays} dias atrás`;

        return date.toLocaleDateString("pt-BR");
    };

    // Formatar contagem de itens
    const formatItemCount = (itemCount: number) => {
        if (itemCount === 0) return "0";
        if (itemCount < 1000) return itemCount.toString();
        return `${(itemCount / 1000).toFixed(1)}k`;
    };

    return (
        <div className="p-6">
            {/* Cabeçalho */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-800">Disciplinas</h1>
                    <div className="flex items-center gap-3">
                        {/* Botões de Ação em Lote */}
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

                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <Plus size={20} />
                            Nova Disciplina
                        </button>
                    </div>
                </div>

                {/* Barra de Ferramentas */}
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Pesquisa */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Pesquisar disciplinas..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 model-input"
                        />
                    </div>

                    {/* Filtros */}
                    <div className="flex gap-3">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                            className="px-4 py-2.5 model-input"
                        >
                            <option value="all">Todas as disciplinas</option>
                            <option value="favorites">Favoritas</option>
                            <option value="needs-review">Precisa revisar</option>
                        </select>

                        <button className="px-4 py-2.5 border model-input flex items-center gap-2">
                            <Filter size={18} />
                            Mais filtros
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabela */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {/* Checkbox */}
                                <th className="w-12 px-6 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.length === paginatedDisciplines.length && paginatedDisciplines.length > 0}
                                        onChange={handleSelectAll}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </th>

                                {/* Nome */}
                                <th
                                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort("name")}
                                >
                                    <div className="flex items-center gap-1">
                                        Disciplina
                                        {sortField === "name" && (
                                            sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                                        )}
                                    </div>
                                </th>

                                {/* Itens */}
                                <th
                                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort("itemCount")}
                                >
                                    <div className="flex items-center gap-1">
                                        Itens
                                        {sortField === "itemCount" && (
                                            sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                                        )}
                                    </div>
                                </th>

                                {/* Progresso */}
                                <th
                                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort("progress")}
                                >
                                    <div className="flex items-center gap-1">
                                        Progresso
                                        {sortField === "progress" && (
                                            sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                                        )}
                                    </div>
                                </th>

                                {/* Último Estudo */}
                                <th
                                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort("lastStudied")}
                                >
                                    <div className="flex items-center gap-1">
                                        Último Estudo
                                        {sortField === "lastStudied" && (
                                            sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                                        )}
                                    </div>
                                </th>

                                {/* Ações */}
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                    Ações
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {paginatedDisciplines.map((discipline) => (
                                <tr
                                    key={discipline.id}
                                    className={`hover:bg-gray-50 transition-colors ${selectedRows.includes(discipline.id) ? "bg-blue-50" : ""
                                        }`}
                                >
                                    {/* Checkbox */}
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.includes(discipline.id)}
                                            onChange={() => handleSelectRow(discipline.id)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </td>

                                    {/* Nome e Descrição */}
                                    <td className="px-6 py-4">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                                    <BookOpen size={20} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <NavLink
                                                            to={`/disciplines/${discipline.id}`}
                                                            state={{ breadcrumbName: discipline.name }}
                                                        >
                                                            <span
                                                                className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
                                                            >
                                                                {discipline.name}
                                                            </span>

                                                            {discipline.favorite && (
                                                                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                                            )}
                                                        </NavLink>

                                                    </div>
                                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                                        {discipline.description}
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                            {discipline.cardCount} cards
                                                        </span>
                                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                            {discipline.questionCount} questões
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Contagem de Itens */}
                                    <td className="px-6 py-4">
                                        <div className="text-center">
                                            <span className="font-semibold text-gray-800">
                                                {formatItemCount(discipline.itemCount)}
                                            </span>
                                            <div className="text-xs text-gray-500 mt-1">
                                                itens totais
                                            </div>
                                        </div>
                                    </td>

                                    {/* Progresso */}
                                    <td className="px-6 py-4">
                                        <div className="w-40">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-700">
                                                    {discipline.progress}%
                                                </span>
                                                <BarChart3 size={16} className="text-gray-400" />
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${discipline.progress >= 80 ? "bg-green-500" :
                                                        discipline.progress >= 50 ? "bg-blue-500" :
                                                            discipline.progress >= 20 ? "bg-yellow-500" : "bg-red-500"
                                                        }`}
                                                    style={{ width: `${discipline.progress}%` }}
                                                ></div>
                                            </div>
                                            {discipline.progress < 70 && (
                                                <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                                                    Precisa revisar
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Último Estudo */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-gray-400" />
                                            <span className="text-sm text-gray-700">
                                                {formatDate(discipline.lastStudied)}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Ações */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => navigate(`/study/session?discipline=${discipline.id}`)}
                                                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                                title="Estudar"
                                            >
                                                <Play size={18} />
                                            </button>

                                            <button
                                                onClick={() => navigate(`/disciplines/${discipline.id}/edit`)}
                                                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                                title="Editar"
                                            >
                                                <Edit size={18} />
                                            </button>

                                            <div className="relative group">
                                                <button
                                                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                                    title="Mais opções"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {/* Dropdown Menu */}
                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                                    <div className="py-1">
                                                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
                                                            Exportar dados
                                                        </button>
                                                        <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                                                            Excluir disciplina
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Estado Vazio */}
                    {paginatedDisciplines.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                                <BookOpen size={64} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                Nenhuma disciplina encontrada
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {search ? "Tente ajustar sua busca" : "Comece criando sua primeira disciplina"}
                            </p>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                            >
                                Criar Primeira Disciplina
                            </button>
                        </div>
                    )}
                </div>

                {filteredDisciplines.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">

                            {/* Resumo */}
                            <div className="text-sm text-gray-600">
                                Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                                {Math.min(currentPage * ITEMS_PER_PAGE, filteredDisciplines.length)}
                                {" "}de {disciplines.length} disciplinas
                                {search && ` • Filtrado por: "${search}"`}
                            </div>

                            <div className="flex items-center gap-4">

                                {/* Métrica */}
                                <div className="text-sm text-gray-600">
                                    <span className="font-medium">
                                        {disciplines.reduce((acc, d) => acc + d.itemCount, 0)}
                                    </span>{" "}
                                    itens no total
                                </div>

                                {/* Paginação */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={goToPrevious}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Anterior
                                    </button>

                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => goToPage(i + 1)}
                                            className={`px-3 py-1.5 text-sm rounded-lg border ${currentPage === i + 1
                                                ? "bg-blue-50 text-blue-600 border-blue-200"
                                                : "border-gray-300 hover:bg-gray-50"
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}

                                    <button
                                        onClick={goToNext}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Próxima
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            <CreateDisciplineModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                reloadTable={getAllDiscipline}
            />
        </div>
    );
}