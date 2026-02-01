import { useTauri } from "@/context/TauriContext";
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoutes: React.FC = () => {

    const { session, initialized } = useTauri();

    if (!initialized) return <div>Carregando...</div>;

  
    if (!session.isLogged()) {
      return <Navigate to="/login" replace />;
    }

    return <Outlet />

}

export default ProtectedRoutes;