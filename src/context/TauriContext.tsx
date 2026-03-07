import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {User} from '@/types/models';
import AuthStoreManager from "@/util/AuthStoreManager";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentUser } from "@/tauri/user";

interface TauriContextType {
  invoke: typeof invoke;
  user: User | null;
  setUser: (toast: User) => void;
  loading: boolean; // Adiciona estado de loading
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const TauriContext = createContext<TauriContextType | undefined>(undefined);

export function TauriProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true); // Para controlar carregamento
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    const checkAuthCookie =  async () => {
      try {
        const authData = await AuthStoreManager.get();
        
        if (!authData || !authData.user) {
          setUser(null);
          setLoading(false);
        }else{
          const user = await getCurrentUser();

          if(!user.code || !user.user){
            setLoading(false);
            await AuthStoreManager.remove();
            setUser(null);
          }else{
            setUser(user.user);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Erro ao verificar cookie:', error);
        await AuthStoreManager.remove();
        setUser(null);
        setLoading(false);
      }
    };
    
    checkAuthCookie();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    AuthStoreManager.set(userData, 10);
  };
  
  const logout = () => {
    setUser(null);
    AuthStoreManager.remove();
  };

  const isAuthenticated = !!user;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">
          {loading ? 'Verificando autenticação...' : 'Inicializando aplicação...'}
        </span>
      </div>
    );
  }

  return (
    <TauriContext.Provider value={{
      invoke,
      user,
      setUser: setUser,
      loading,
      login,
      logout,
      isAuthenticated
    }}>
      {children}
    </TauriContext.Provider>
  );
}

export function useTauri() {
  const context = useContext(TauriContext)
  if (!context) {
    throw new Error('useTauri deve ser usado dentro de TauriProvider')
  }
  return context
}