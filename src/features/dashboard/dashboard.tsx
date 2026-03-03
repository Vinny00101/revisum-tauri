import { useTauri } from "@/context/TauriContext";
import { useToast } from "@/context/ToastContext";
import { get_review_log, getCurrentUser } from "@/tauri/user";
import { formatDate, formatStudyTime } from "@/util/FormatData";
import { convertFileSrc } from "@tauri-apps/api/core";
import { Award, Calendar, Clock, Flame, History, Mail } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LogsDashboard from "./components/logs";

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
                console.log(result_log.reviewlog);
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

                {/* Container Principal com Flexbox */}
                <div className="flex flex-col lg:flex-row gap-6">


                    <div className="w-full lg:w-[70%] space-y-6">
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


                    <div className="w-full lg:w-[30%] space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-center items-center">
                                <div className="flex justify-center items-center shadow-sm w-24 h-24 bg-blue-600 rounded-3xl rotate-3 hover:rotate-6 overflow-hidden text-white text-3xl font-bold">
                                    {user?.avatar_path ? <img src={convertFileSrc(user.avatar_path)} alt="Avatar" className="w-full h-full object-cover" /> : user?.username.charAt(0).toUpperCase()}
                                </div>
                            </div>


                            <div className="border-t border-t-gray-300 mt-4">
                                <div className="flex-1 justify-center text-center md:text-left">
                                    <h1 className="text-2xl text-center font-bold text-gray-900">{user?.username}</h1>
                                    <div className="flex justify-center w-full flex-wrap gap-2 mt-2 text-gray-500 text-sm">
                                        <span className="flex items-center gap-1">
                                            <Mail size={16} /> {user?.email}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar size={16} /> Membro desde {user?.created_at ? formatDate(user.created_at) : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>



                        <div className="bg-white rounded-2xl border shadow-sm border-gray-100 min-h-75">
                            <div className="bg-gray-900 rounded-tl-2xl rounded-tr-2xl flex items-center justify-between mb-6 p-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-blue-600 rounded-lg">
                                        <History size={16} className="text-white" />
                                    </div>
                                    <h3 className="text-xs font-bold text-white">Atividade Recente</h3>
                                </div>
                                <span className="text-[9px] uppercase tracking-wider font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                    Últimas 5 revisões
                                </span>
                            </div>
                            <LogsDashboard logs={reviewLog} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}