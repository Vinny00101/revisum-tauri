import { NavLink } from "react-router-dom";
import { BookOpen, BookText, Home } from "lucide-react";
import { convertFileSrc } from "@tauri-apps/api/core";

interface SidebarProps {
  collapsed?: boolean;
  username?: string;
  avatar_path?: string | null  | undefined;
  email?: string;
  logout: () => void;
}

export default function Sidebar({
  collapsed = false,
  username,
  avatar_path,
  email,
  logout
}: SidebarProps) {

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
    { id: "disciplines", label: "Disciplinas", icon: BookText, path: "/disciplines" },
    { id: "reviews", label: "Revisões", icon: BookOpen, path: "/reviews" },
  ];

  return (
    <aside className={`bg-gray-900 text-white transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} h-screen flex flex-col`}>
      <div className="px-6">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center py-1.75">
              <img className="w-10 h-15" src="/revisum_dark.svg" alt="Revisum" />
              <h1 className="text-xl font-bold">evisum</h1>
            </div>
          )}
          {collapsed && (
            <div className="py-1.75 flex items-center justify-center">
              <img className="w-10 h-15" src="/revisum_dark.svg" alt="Revisum" />
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) => `
              flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
              ${isActive
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-800 text-gray-300 hover:text-white"
                }
  `}
            >
              <Icon size={20} className="shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-10 h-10 bg-gray-700 rounded-full overflow-hidden flex items-center justify-center">
              {avatar_path ? (
                <img src={convertFileSrc(avatar_path)} alt="Avatar" className="w-full h-full object-cover" />
              ):(
                <span className="font-bold">{username?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{username}</p>
              <p className="text-sm text-gray-400 truncate max-w-25">{email}</p>
            </div>
            <button onClick={logout} className="p-2 rounded hover:bg-gray-800 h-ful flex justify-centerl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}