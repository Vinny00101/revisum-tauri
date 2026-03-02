import { useTauri } from "@/context/TauriContext";
import { useToast } from "@/context/ToastContext";
import { get_review_log, getCurrentUser } from "@/tauri/user";
import { formatDate } from "@/util/FormatData";
import { convertFileSrc } from "@tauri-apps/api/core";
import { Calendar, Mail } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto">

                {/* Container Principal com Flexbox */}
                <div className="flex flex-col lg:flex-row gap-6">


                    <div className="w-full lg:w-[70%] space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 min-h-100">
                            <h2 className="text-gray-400 font-medium">Conteúdo Principal (70%)</h2>
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

                        <div className="bg-white rounded-2xl border border-gray-100 p-6 min-h-75">
                            <h2 className="text-gray-400 font-medium">Mini Widget / Stats</h2>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}