import { BookOpen, Filter, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import {ModalStudyItem} from "../components/ModalStudyItem";
import { useNavigate, useParams } from "react-router-dom";
import { number } from "framer-motion";
import { DataTable } from "@/components/tables/DataTables";
import { studyItemColumns } from "../components/studyItem/studyItemColumns";
import { Content, StudyItemFullResponse } from "../types/interfaces";
import { useSmartFilterSearch } from "@/components/tables/hooks/useBarTools";
import { studyItemFilters, studyItemSearch } from "../components/studyItem/studyItemTool";
import { useToast } from "@/context/ToastContext";
import { get_content } from "@/tauri/content";
import { get_all_study_item } from "@/tauri/studyItem";
import { Breadcrumb } from "@/components/dashboard/Breadcrumb";


export function Context() {
    const { id, contentid } = useParams();
    const { showToast } = useToast();
    const [studyItem, setStudyItem] = useState<StudyItemFullResponse[]>([]);
    const [Content, setContent] = useState<Content>();
    const [isCreateStudyItem, setIsCreateStudyItem] = useState(false);
    const navigate = useNavigate();
    const { filter, setFilter, processedData } = useSmartFilterSearch(studyItem, studyItemFilters, "all", studyItemSearch);



    const getContent = async () => {
        try {
            if (!id || !contentid) {
                showToast({
                    type: "error",
                    message: "O identificador único não existe no parâmetro da url.",
                });
                navigate(`/disciplines/${id}`);
                return;
            }
            const discipline = await get_content(number.parse(contentid), number.parse(id));

            if (!discipline.content) {
                showToast({
                    type: "error",
                    message: "Não existe uma disciplina com esse identificador único.",
                });
                navigate(`/disciplines/${id}`);
                return;
            }

            getAllStudyItems(number.parse(contentid));

            setContent(discipline.content);
        } catch (err: any) {
            navigate("/disciplines");
            showToast({
                type: "error",
                message: "O identificador único da disciplina deve ser um número." + err,
            });

        }
    };

    const getAllStudyItems = async (contentId: number) => {
        try {
            const result = await get_all_study_item(contentId);
            if (!result.message.code || !result.study_items) {
                showToast({
                    type: "error",
                    message: result.message.message
                })
            } else {
                const adapted = result.study_items;
                setStudyItem(adapted);
            }
        } catch (err: any) {
            showToast({
                type: "error",
                message: "Erro no rust",
            });
        }
    }

    useEffect(() => {
        getContent();
    }, []);


    return (
        <div className="space-y-6">
                {/* Breadcrumb */}
                <Breadcrumb/>

                {/* Hero Section - Card do Conteúdo */}
                {Content && (
                    <div className="relative bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 overflow-hidden">

                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: `
                            linear-gradient(135deg, 
                                rgba(59, 130, 246, 0.03) 0%, 
                                rgba(37, 99, 235, 0.02) 50%, 
                                rgba(29, 78, 216, 0.03) 100%
                            ),
                            repeating-linear-gradient(
                                45deg,
                                rgba(37, 99, 235, 0.02) 0px,
                                rgba(37, 99, 235, 0.02) 2px,
                                rgba(59, 130, 246, 0.03) 2px,
                                rgba(59, 130, 246, 0.03) 6px,
                                rgba(37, 99, 235, 0.02) 6px,
                                rgba(37, 99, 235, 0.02) 10px
                            ),
                            repeating-linear-gradient(
                                135deg,
                                transparent 0px,
                                transparent 15px,
                                rgba(59, 130, 246, 0.02) 15px,
                                rgba(59, 130, 246, 0.02) 30px
                            )
                            `
                            }}
                        />


                        {/* Overlay com gradiente suave para suavizar as bordas */}
                        <div className="absolute inset-0 bg-linear-to-r from-white via-transparent to-white pointer-events-none" />

                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex gap-5">
                                {/* Ícone decorativo */}
                                <div className="hidden sm:block">
                                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 relative overflow-hidden">
                                        {/* Padrão inclinado dentro do ícone */}
                                        <div
                                            className="absolute inset-0 opacity-20"
                                            style={{
                                                background: `
                                    repeating-linear-gradient(
                                        45deg,
                                        rgba(255,255,255,0.2) 0px,
                                        rgba(255,255,255,0.2) 2px,
                                        transparent 2px,
                                        transparent 6px
                                    )
                                `
                                            }}
                                        />
                                        <BookOpen size={32} className="text-white relative z-10" />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                            {Content.title}
                                        </h1>
                                        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200 shadow-sm">
                                            Ordem {Content.display_order}
                                        </span>
                                    </div>

                                    {Content.description && (
                                        <p className="text-gray-600 max-w-2xl leading-relaxed">
                                            {Content.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Seção de Itens de Estudo */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

                    {/* Header da seção */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                Itens de Estudo
                                {studyItem.length > 0 && (
                                    <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                                        {studyItem.length}
                                    </span>
                                )}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Gerencie os itens de estudo deste conteúdo
                            </p>
                        </div>

                        <button
                            onClick={() => setIsCreateStudyItem(true)}
                            className="inline-flex items-center justify-center px-5 py-2.5 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-sm shadow-blue-200 hover:shadow-md transition-all duration-200"
                        >
                            <Plus size={18} className="mr-2" />
                            Novo item de estudo
                        </button>
                    </div>

                    {/* Barra de ferramentas */}
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <BookOpen size={18} className="text-gray-400" />
                            <span>Total de itens: <span className="font-semibold text-gray-900">{studyItem.length}</span></span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value as any)}
                                    className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors cursor-pointer"
                                >
                                    {studyItemFilters.map((filterOption) => (
                                        <option key={filterOption.key} value={filterOption.key}>
                                            {filterOption.label}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <Filter size={16} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Tabela */}
                    {studyItem.length === 0 ? (
                        <div className="text-center py-16 px-4">
                            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <BookOpen size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Nenhum item de estudo
                            </h3>
                            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                                Comece adicionando seu primeiro item de estudo para este conteúdo.
                            </p>
                            <button
                                onClick={() => setIsCreateStudyItem(true)}
                                className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition-colors"
                            >
                                <Plus size={18} className="mr-2" />
                                Adicionar item
                            </button>
                        </div>
                    ) : (
                        <DataTable
                            data={processedData}
                            columns={studyItemColumns}
                            pageSize={5}
                        />
                    )}
                </div>

                <ModalStudyItem
                    contentId={number.parse(contentid!)}
                    onClose={() => setIsCreateStudyItem(false)}
                    isOpen={isCreateStudyItem}
                    reload={() => getAllStudyItems(number.parse(contentid!))}
                />
            </div>
            );
}