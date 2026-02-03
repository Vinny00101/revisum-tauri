import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";
import { useTauri } from "@/context/TauriContext";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const routeRedirection = "/login"
  const { user, logout } = useTauri();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(routeRedirection);
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden overscroll-none">
      <Sidebar
        collapsed={sidebarCollapsed}
        username={user?.name}
        email={user?.email}
        logout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-h-0">
        <Navbar
          onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
          username={user?.name}
        />

        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          <main className="flex-1 p-6">
            {children || <Outlet />}
          </main>

          <footer className="border-t border-gray-200 px-6 py-4 shrink-0">
            <p className="text-sm text-gray-600 text-center">
              © {new Date().getFullYear()} Revisum. Todos os direitos reservados.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}