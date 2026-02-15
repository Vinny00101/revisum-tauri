import { Settings, Calendar, Clock, Award, Flame, Mail } from "lucide-react";
import ModalUser from "../components/modalProfile";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/context/ToastContext";
import { getCurrentUser } from "@/tauri/user";
import { useNavigate } from "react-router-dom";
import { convertFileSrc } from '@tauri-apps/api/core';
import { useTauri } from "@/context/TauriContext";

export function Profile() {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const {user, setUser } = useTauri();
  const { showToast } = useToast();

  /*
  const userData = {
    username: "DevMaster",
    email: "contato@exemplo.com",
    avatar_path: null,
    created_at: "Janeiro 2024",
    status: {
      current_streak: 12,
      longest_streak: 25,
      total_study_time: 450, // em minutos
    }
  };
  */

  const fetchUserData = useCallback(async () => {
    try {
      const result = await getCurrentUser();

      if (!result.code || !result.user) {
        navigate("/");
      } else {
        setUser(result.user);
      }
    } catch (err) {
      showToast({ type: "error", message: "Erro ao carregar dados do perfil" });
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
              <Calendar size={16} /> Membro desde {user?.createdAt}
            </span>
          </div>
        </div>

        <button 
        onClick={() => setIsCreateModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
          <Settings size={18} /> Editar Perfil
        </button>
      </div>

      {/* Grid de Estatísticas (user_status) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Streak Atual */}
        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 flex items-center gap-4">
          <div className="p-3 bg-orange-500 rounded-xl text-white">
            <Flame size={24} />
          </div>
          <div>
            <p className="text-orange-600 text-sm font-medium">Ofensiva Atual</p>
            <p className="text-2xl font-bold text-orange-900">{user?.status?.current_streak} dias</p>
          </div>
        </div>

        {/* Recorde de Ofensiva */}
        <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 flex items-center gap-4">
          <div className="p-3 bg-purple-500 rounded-xl text-white">
            <Award size={24} />
          </div>
          <div>
            <p className="text-purple-600 text-sm font-medium">Melhor Ofensiva</p>
            <p className="text-2xl font-bold text-purple-900">{user?.status?.current_streak} dias</p>
          </div>
        </div>

        {/* Tempo de Estudo */}
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-center gap-4">
          <div className="p-3 bg-blue-500 rounded-xl text-white">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-blue-600 text-sm font-medium">Tempo de Estudo</p>
            { user?.status?.total_study_time && (
              <p className="text-2xl font-bold text-blue-900">
                {Math.floor(user.status.total_study_time / 60)}h {user.status.total_study_time % 60}m
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Seção Inferior - Atividade Recente (Placeholder) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-gray-800 mb-4">Atividade Recente</h3>
        <div className="space-y-4">
          <div className="h-20 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-400">
            O histórico de revisões será exibido aqui
          </div>
        </div>
      </div>

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