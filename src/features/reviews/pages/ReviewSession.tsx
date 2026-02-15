import { Brain, Clock, RotateCw } from "lucide-react";
import { useState } from "react";
import { ReviewCard } from "./ReviewCard";

export function ReviewSession() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const reviewItems = [
    {
      id: 1,
      front: "O que é uma função quadrática?",
      back: "Função do tipo f(x) = ax² + bx + c, onde a ≠ 0",
      type: "card" as const
    },
    {
      id: 2,
      front: "Qual a fórmula de Bhaskara?",
      back: "x = (-b ± √(b² - 4ac)) / 2a",
      type: "card" as const
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header da sessão */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-200">
                <Brain size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sessão de Revisão</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Mantenha o foco e revise no seu ritmo
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
                <Clock size={16} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">12 min restantes</span>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <RotateCw size={18} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Progresso da sessão</span>
              <span className="font-medium text-gray-900">{currentIndex + 1}/{reviewItems.length}</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / reviewItems.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card de revisão */}
        <ReviewCard 
          front={reviewItems[currentIndex].front}
          back={reviewItems[currentIndex].back}
          type={reviewItems[currentIndex].type}
        />

        {/* Dica de foco */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Mantenha o foco e responda com honestidade para melhores resultados
          </p>
        </div>
      </div>
    </div>
  );
}