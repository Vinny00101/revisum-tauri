import { useTauri } from "@/context/TauriContext";
import { useToast } from "@/context/ToastContext";
import { get_review_log, getCurrentUser } from "@/tauri/user";
import { formatDate, formatStudyTime } from "@/util/FormatData";
import { convertFileSrc } from "@tauri-apps/api/core";
import { Award, Calendar, Clock, Flame, Mail } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RecentActivity from "@/components/logs";

export function Dashboard() {
    const { user, setUser } = useTauri();
    const [reviewLog, setReviewLog] = useState<any[]>([]);
    const Navigate = useNavigate();
    const { showToast } = useToast();

    const fetchUserData = useCallback(async () => {
        try {
            const result = await getCurrentUser();

            if (!result.code || !result.user) {
                Navigate("/");
            } else {
                setUser(result.user);
            }

            const result_log = await get_review_log();

            if (!result_log.code || !result_log.reviewlog) {
                showToast({ type: "error", message: "Erro ao carregar logs do perfil" + result_log.message })
            } else {
                setReviewLog(result_log.reviewlog);
            }
        } catch (err: any) {
            showToast({ type: "error", message: "Erro ao carregar dados do perfil" + err });
        }
    }, [showToast]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData])


    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto">

                {/* Header com saudação */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none">
                                Olá, {user?.username || 'Estudante'}
                            </h1>
                            <p className="text-gray-500 mt-1.5 font-medium">
                                Pronto para bater sua meta de hoje?
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2">
                            <Calendar size={18} className="text-blue-500" />
                            <span className="text-sm font-medium text-gray-700">
                                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="w-full space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                        <div className=" bg-white rounded-2xl flex flex-col justify-between shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-orange-50 to-orange-100 flex items-center justify-center border border-orange-200">
                                    <Flame size={24} className="text-orange-600" />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Ofensiva Atual</p>
                            <h3 className="text-2xl font-bold text-gray-900">{user?.status?.current_streak ?? 0} dias</h3>
                            <p className="text-xs text-gray-500 mt-2">
                                Mantenha a sequência de estudos! 🔥
                            </p>
                        </div>

                        <div className=" bg-white rounded-2xl flex flex-col justify-between shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-green-50 to-green-100 flex items-center justify-center border border-green-200">
                                    <Award size={24} className="text-green-600" />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Melhor Ofensiva</p>
                            <h3 className="text-2xl font-bold text-gray-900">{user?.status?.longest_streak ?? 0} dias</h3>
                            <p className="text-xs text-gray-500 mt-2">
                                Melhore sua sequência de estudos! 🔥
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl flex flex-col justify-between shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-green-50 to-indigo-100 flex items-center justify-center border border-indigo-200">
                                    <Clock size={24} className="text-indigo-900" />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Tempo Total</p>
                            <h3 className="text-2xl font-bold text-gray-900">{formatStudyTime(user?.status?.total_study_time) ?? 0} </h3>
                            <p className="text-xs text-gray-500 mt-2">
                                Aumente sua produtividade! 🔥
                            </p>
                        </div>
                    </div>
                </div>

                {/* Container Principal com Flexbox */}
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="w-full h-fit flex flex-col lg:flex-row gap-6">

                        {/* COLUNA ESQUERDA: Logs (70% no desktop) */}
                        <div className="flex w-full lg:w-[70%]">
                            <div className="w-full h-full">
                                 <RecentActivity logs={reviewLog} limit={6} />
                            </div>
                        </div>

                        {/* COLUNA DIREITA: Perfil + CTA empilhados (Flex-1) */}
                        <div className="flex-1 flex flex-col gap-6">

                            {/* Card 1: Perfil */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
                                <div className="flex justify-center items-center mb-4">
                                    <div className="flex justify-center items-center shadow-sm w-20 h-20 bg-blue-600 rounded-3xl rotate-3 hover:rotate-6 transition-transform overflow-hidden text-white text-3xl font-bold">
                                        {user?.avatar_path ? (
                                            <img src={convertFileSrc(user.avatar_path)} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            user?.username.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-4 text-center">
                                    <h1 className="text-xl font-bold text-gray-900">{user?.username}</h1>
                                    <div className="flex flex-col gap-1 mt-2 text-gray-500 text-xs">
                                        <span className="flex items-center justify-center gap-1">
                                            <Mail size={14} /> {user?.email}
                                        </span>
                                        <span className="flex items-center justify-center gap-1">
                                            <Calendar size={14} /> Membro desde {user?.created_at ? formatDate(user.created_at) : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: CTA (Aprendizado) */}
                            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between gap-6">
                                <div className="text-center">
                                    <h3 className="text-[16px] font-bold text-gray-900">O que vamos aprender hoje?</h3>
                                    <p className="text-gray-500 text-sm mt-1">Acesse suas disciplinas e comece a criar novos cards.</p>
                                </div>

                                <div className="flex flex-col gap-2 w-full">
                                    <button
                                        onClick={() => Navigate('/disciplines')}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-50 text-sm"
                                    >
                                        Ver Disciplinas
                                    </button>
                                    <button
                                        onClick={() => Navigate('/reviews')}
                                        className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-blue-600 font-bold rounded-xl transition-all text-sm border border-blue-50"
                                    >
                                        Ir para Revisões
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>


                </div>

            </div>
        </div>
    );
}