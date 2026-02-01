import AnimatedMessage from "@/components/animation/message";
import { useTauri } from "@/context/TauriContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { userService } = useTauri();

  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ code: boolean; message: string } | null>(null);

  const handleRegister = async () => {
    setMessage(null);

    try {
      const result = await userService.createUserService(nome, password, email);

      if (!result.code) {
        setMessage({ code: false, message: result.message });

      } else {
        setMessage({ code: true, message: result.message });

        navigate("/");
      }
    } catch (err: any) {
      setMessage({ code: false, message: "Erro inesperado ao tentar logar." });

      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }

  };

  const handleLoginRedirect = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 overflow-hidden overscroll-none">

      <AnimatedMessage
        message={message}
        onMessageClear={() => setMessage(null)}
        duration={2500}
      />
      <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          Revisum
        </h1>
        <p className="text-center text-gray-600 mb-8">Crie sua conta</p>

        <div className="space-y-5">
          <div>
            <input
              id="nome"
              type="text"
              placeholder="Digite seu nome completo"
              value={nome}
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