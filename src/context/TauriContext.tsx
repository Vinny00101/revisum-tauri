import { connectiondatabase } from "@/lib/db";
import DisciplineRepository from "@/lib/repository/discipline/DisciplineRepository";
import UserRepository from "@/lib/repository/user/UserRepository";
import SessionManager from "@/service/SessionManager";
import UserService from "@/service/UserService";
import { invoke } from "@tauri-apps/api/core";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface TauriContextType {
  invoke: typeof invoke;
  userService: UserService;
  session: SessionManager;
  initialized: boolean;
}

const TauriContext = createContext<TauriContextType | undefined>(undefined);

export function TauriProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [session] = useState(() => new SessionManager());
  const [userService, setUserService] = useState<UserService | null>(null);

  useEffect(() => {
    async function init() {
      try {
        await connectiondatabase.init();
        const db = await connectiondatabase.get();
        const userRepository = new UserRepository(db);
        const disciplineRepository = new DisciplineRepository(db);
        if(disciplineRepository){
          
        }
        const service = new UserService(userRepository, session);

        setUserService(service);
        setInitialized(true);
        console.log("Banco e UserService prontos");
      } catch (err) {
        console.error("Erro ao inicializar banco:", err);
      }
    }

    init();
  },[session]);

  if (!initialized || !userService) {
    return <div>Carregando...</div>;
  }

  return (
    <TauriContext.Provider value={{
      invoke,
      session,
      userService,
      initialized
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