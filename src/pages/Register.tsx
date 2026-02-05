import AnimatedMessage from "@/components/animation/message";
import { useTauri } from "@/context/TauriContext";
import { useToast } from "@/context/ToastContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { userService, invoke } = useTauri();

  const navigate = useNavigate();
  const [username, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: MessageType; message: string } | null>(null);
  const { showToast } = useToast();

  const handleRegister = async () => {
    setMessage(null);

    try {
      const result = await invoke<{ code: number; message: string }>(
        "create_user_command",{username: username, password: password, email: email}
      )
      //const result = await userService.createUserService(nome, password, email);

      if (!result.code) {
        showToast({ type: "error", message: result.message });

      } else {
        showToast({type: "success", message: result.message})
        navigate("/login");
      }
    } catch (err: any) {
      showToast({ type: "error", message: "Erro inesperado ao tentar logar." });

      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }

  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 overflow-hidden overscroll-none">

      <AnimatedMessage
        message={message}
        onMessageClear={() => setMessage(null)}
        duration={2500}
      />
      <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md">
        <div className="w-full h-fit flex justify-center items-center">
          <img className="w-15 h-20" src="/revisum_ligh.svg" alt="Revisum" />
          <h1 className="text-4xl font-bold text-center text-gray-800">
            evisum
          </h1>
        </div>
        <p className="text-center text-gray-600 mb-8">Crie sua conta</p>

        <div className="space-y-5">
          <div>
            <input
              id="nome"
              type="text"
              placeholder="Digite seu nome completo"
              value={username}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-3 base-input"
            />
          </div>

          <div>
            <input
              id="email"
              type="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 base-input"
            />
          </div>

          {/* Campo Senha */}
          <div>
            <input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 base-input"
            />
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Criando..." : "Cria conta"}
          </button>
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Já tem uma conta?</span>
            </div>
          </div>
          <button
            onClick={handleLoginRedirect}
            className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-medium py-3 rounded-lg transition duration-200"
          >
            Voltar para Login
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Ao criar uma conta, você concorda com nossos Termos de Uso e Política de Privacidade.
        </p>
      </div>
    </div>
  );
}