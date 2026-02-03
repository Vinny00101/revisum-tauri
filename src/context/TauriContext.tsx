import { connectiondatabase } from "@/lib/db";
import DisciplineRepository from "@/lib/repository/discipline/DisciplineRepository";
import UserRepository from "@/lib/repository/user/UserRepository";
import DisciplineService from "@/service/DisciplineService";
import UserService from "@/service/UserService";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {User} from '@/types/TypeInterface';
import AuthStoreManager from "@/util/AuthStoreManager";

interface TauriContextType {
  user: User | null;
  userService: UserService;
  discService: DisciplineService;
  initialized: boolean;
  loading: boolean; // Adiciona estado de loading
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const TauriContext = createContext<TauriContextType | undefined>(undefined);

export function TauriProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true); // Para controlar carregamento
  const [userService, setUserService] = useState<UserService | null>(null);
  const [discService, setDiscService] = useState<DisciplineService | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    const checkAuthCookie =  async () => {
      try {
        const authData = await AuthStoreManager.get();
        
        if (!authData) {
          console.log('Nenhum dado no store foi encontrado');
          setUser(null);
          setLoading(false);
        }else{
          console.log('Usuário encontrado no cookie:', authData.user);
          setUser(authData.user);
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

  useEffect(() => {
    async function init() {
      try {
        await connectiondatabase.init();
        const db = await connectiondatabase.get();
        const userRepository = new UserRepository(db);
        const disciplineRepository = new DisciplineRepository(db);
        const userService = new UserService(userRepository);
        const disciplineService = new DisciplineService(disciplineRepository, userRepository);

        setUserService(userService);
        setDiscService(disciplineService);
        setInitialized(true);
        console.log("Banco e serviços inicializados");
      } catch (err) {
        console.error("Erro ao inicializar banco:", err);
      }
    }

    init();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    AuthStoreManager.set(userData, 10);
    console.log('Usuário logado:', userData);
  };
  
  const logout = () => {
    setUser(null);
    AuthStoreManager.remove();
    console.log('Usuário deslogado');
  };

  const isAuthenticated = !!user;

  if (loading || !initialized || !userService || !discService) {
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
      user,
      userService: userService!,
      discService: discService!,
      initialized,
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