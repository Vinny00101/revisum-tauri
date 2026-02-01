import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";
import { useTauri } from "@/context/TauriContext";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const {session} = useTauri();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden overscroll-none">
      <Sidebar 
        collapsed={sidebarCollapsed}
        username={session.getUser()?.username}
        email={session.getUser()?.email}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar 
          onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
          sidebarCollapsed={sidebarCollapsed}
          username={session.getUser()?.username}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          {children || <Outlet />}
        </main>
        
        <footer className="border-t border-gray-200 px-6 py-4">
          <p className="text-sm text-gray-600 text-center">
            © {new Date().getFullYear()} Revisum. Todos os direitos reservados.
          </p>
        </footer>
      </div>
    </div>
  );
}