import { NavLink } from "react-router-dom";
import { useState } from "react";
import { BarChart3, BookOpen, BookText, HelpCircle, Home, Settings, Tag } from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
  username?: string;
  email?: string;
}

export default function Sidebar({ 
    collapsed = false, 
    username,
    email
}: SidebarProps) {
  const [activeItem, setActiveItem] = useState("dashboard");

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
    { id: "disciplines", label: "Disciplinas", icon: BookText, path: "/disciplines" },
    { id: "reviews", label: "Revisões", icon: BookOpen, path: "/reviews" },
    { id: "questions", label: "Questões", icon: HelpCircle, path: "/questions" },
    { id: "categories", label: "Categorias", icon: Tag, path: "/categories" },
    { id: "analysis", label: "Análises", icon: BarChart3, path: "/analysis" },
    { id: "config", label: "Configurações", icon: Settings, path: "/settings" },
  ];

  return (
    <aside className={`bg-gray-900 text-white transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} h-screen flex flex-col`}>
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="font-bold text-lg">R</span>
              </div>
              <h1 className="text-xl font-bold">Revisum</h1>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
              <span className="font-bold text-lg">R</span>
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
            to={`/${item.id}`}
            onClick={() => setActiveItem(item.id)}
            className={({ isActive }) => `
              flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
              ${isActive || activeItem === item.id
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-800 text-gray-300 hover:text-white'
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
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="font-bold">U</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold">{username}</p>
              <p className="text-sm text-gray-400 truncate max-w-25">{email}</p>
            </div>
            <button className="p-2 rounded hover:bg-gray-800 h-ful flex justify-centerl">
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