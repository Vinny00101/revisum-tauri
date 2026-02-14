import { useTauri } from "@/context/TauriContext";
import { convertFileSrc } from "@tauri-apps/api/core";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  onMenuClick?: () => void;
  sidebarCollapsed?: boolean;
  username?: string;
}

export default function Navbar({ onMenuClick, sidebarCollapsed, username = "Usuário" }: NavbarProps) {
  const {user} = useTauri();
  const navigate = useNavigate();
  const [notifications] = useState([
    { id: 1, title: "Nova questão adicionada", time: "2 min atrás" },
    { id: 2, title: "Revisão pendente", time: "1 hora atrás" },
    { id: 3, title: "Atualização do sistema", time: "3 horas atrás" },
  ]);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Lado Esquerdo */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d={sidebarCollapsed ? "M4 6h16M4 12h16M4 18h16" : "M6 18L18 6M6 6l12 12"} />
            </svg>
          </button>
        </div>

        {/* Lado Direito */}
        <div className="flex items-center space-x-4">
          {/* Notificações */}
          <div className="relative group">
            <button className="p-2 rounded-lg hover:bg-gray-100 relative">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Dropdown de Notificações */}
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Notificações</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-gray-200">
                <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Ver todas as notificações
                </button>
              </div>
            </div>
          </div>

          {/* Modo Escuro/Claro */}
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>

          {/* Perfil */}
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center space-x-3 p-1 rounded-lg transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full overflow-hidden flex items-center justify-center">
              {user?.avatar_path ?(
                <img src={convertFileSrc(user.avatar_path)} alt="Avatar" className="w-full h-full object-cover" />
              ): (
                 <span className="font-bold text-blue-600">{username.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="hidden md:flex items-center">
              <p className="font-semibold text-gray-800 mr-2">{username}</p>
              <svg
                className="w-4 h-4 text-gray-500 group-hover:text-gray-800 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}