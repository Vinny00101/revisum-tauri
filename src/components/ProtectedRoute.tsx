import { useTauri } from "@/context/TauriContext";
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoutes: React.FC = () => {

    const { isAuthenticated, initialized, loading } = useTauri();

    if (loading || !initialized) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Carregando...</span>
        </div>
      );
    }
  
    if (!isAuthenticated) {
      console.log('Usuário não autenticado, redirecionando para login');
      return <Navigate to="/login" replace />;
    }

    console.log('Usuário autenticado, permitindo acesso');
    return <Outlet />;

}

export default ProtectedRoutes;