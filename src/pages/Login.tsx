import { useTauri } from "@/context/TauriContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedMessage from "@/components/animation/message";
import { useToast } from "@/context/ToastContext";
import { authenticateUser } from "@/tauri/user";
import { MessageType } from "@/types/types";

export default function Login() {
  const { login } = useTauri();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [message, setMessage] = useState<{ type: MessageType; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const {showToast} = useToast();



  const handleLogin = async () => {

    setLoading(true);
    setMessage(null);

    try {
      const result = await authenticateUser(username, senha);
  
      if (!result.code || !result.user) {
        showToast({type: "error", message: result.message});
      } else {
        showToast({ type: "success", message: result.message });
        login(result.user);
        navigate("/dashboard");
      }
    } catch (err: any) {
      showToast({type: "error", message: "Erro inesperado ao tentar logar."});
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigate("/register");
  };


  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-100 overflow-hidden overscroll-none">

      <AnimatedMessage
        message={message}
        onMessageClear={() => setMessage(null)}
        duration={2500}
      />
      <div className="z-10 bg-white p-10 rounded-xl shadow-2xl w-full max-w-md">
        <div className="w-full h-fit flex justify-center items-center">
          <img className="w-15 h-20" src="/revisum_ligh.svg" alt="Revisum" />
          <h1 className="text-4xl font-bold text-center text-gray-800">
            evisum
          </h1>
        </div>
        <p className="text-center text-gray-600 mb-8">Entre para continuar</p>

        <div className="space-y-5">
          <input
            type="username"
            placeholder="Nome"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 base-input"
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full px-4 py-3 base-input"
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">ou</span>
          </div>
        </div>

        <button
          onClick={handleRegister}
          className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-medium py-3 rounded-lg transition duration-200"
        >
          <span className="flex items-center font-bold justify-center gap-2">
            Registrar-se
          </span>
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Aplicação ainda em desenvolvimento inicial.
        </p>
      </div>
    </div>

  );
}
