import { Settings, Calendar, Mail } from "lucide-react";
import ModalUser from "../components/modalProfile";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/context/ToastContext";
import { get_review_log, getCurrentUser } from "@/tauri/user";
import { useNavigate } from "react-router-dom";
import { convertFileSrc } from '@tauri-apps/api/core';
import { useTauri } from "@/context/TauriContext";
import { UserStatsGrid } from "../components/GridStatus";
import RecentActivity from "../components/logs";
import { formatDate } from "@/util/FormatData";

export function Profile() {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const {user, setUser } = useTauri();
  const [reviewLog, setReviewLog] = useState<any[]>([]);
  const { showToast } = useToast();

  const fetchUserData = useCallback(async () => {
    try {
      const result = await getCurrentUser();

      if (!result.code || !result.user) {
        navigate("/");
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

  const handleUpdateSuccess = () => {
    fetchUserData();
  };


  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">

      {/* Header do Perfil */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 bg-blue-600 rounded-full overflow-hidden flex items-center justify-center text-white text-3xl font-bold">
          { user?.avatar_path ? <img src={convertFileSrc(user.avatar_path)} alt="Avatar" className="w-full h-full object-cover" />: user?.username.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-gray-900">{user?.username}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-gray-500 text-sm">
            <span className="flex items-center gap-1">
              <Mail size={16} /> {user?.email}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={16} /> Membro desde {user?.created_at ? formatDate(user.created_at) : ''}
            </span>
          </div>
        </div>

        <button 
        onClick={() => setIsCreateModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
          <Settings size={18} /> Editar Perfil
        </button>
      </div>

      <UserStatsGrid status={user?.status}/>

      <RecentActivity logs={reviewLog} />

      {user && (
        <ModalUser
          currentUserData={user}
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
}