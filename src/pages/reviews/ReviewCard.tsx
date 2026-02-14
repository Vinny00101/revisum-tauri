import { ChevronLeft, ChevronRight, RotateCw, CheckCircle, XCircle, Volume2, Star } from "lucide-react";
import { useState } from "react";

interface ReviewCardProps {
  front: string;
  back: string;
  type: "card" | "question";
  options?: string[];
  correctAnswer?: string;
}

export function ReviewCard({ front, back, type, options, correctAnswer }: ReviewCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Card principal */}
      <div 
        className="relative cursor-pointer group perspective"
        onClick={() => type === 'card' && setIsFlipped(!isFlipped)}
      >
        <div className={`
          relative w-full min-h-75 transition-all duration-500 transform-style-3d
          ${isFlipped ? 'rotate-y-180' : ''}
        `}>
          {/* Frente do card */}
          <div className={`
            absolute w-full h-full backface-hidden bg-white rounded-2xl shadow-xl border border-gray-200 p-8
            ${isFlipped ? 'invisible' : 'visible'}
          `}>
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                  {type === 'card' ? 'Flashcard' : 'Questão'}
                </span>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Volume2 size={18} className="text-gray-500" />
                </button>
              </div>
              
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xl text-gray-900 font-medium text-center">
                  {front}
                </p>
              </div>
              
              <div className="mt-6 text-center text-sm text-gray-400">
                Clique no card para ver a resposta
              </div>
            </div>
          </div>

          {/* Verso do card */}
          <div className={`
            absolute w-full h-full backface-hidden bg-white rounded-2xl shadow-xl border border-gray-200 p-8 rotate-y-180
            ${isFlipped ? 'visible' : 'invisible'}
          `}>
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
                  Resposta
                </span>
              </div>
              
              <div className="flex-1">
                <p className="text-lg text-gray-900 leading-relaxed">
                  {back}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Opções para questões */}
      {type === 'question' && options && (
        <div className="mt-6 space-y-3">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedOption(option)}
              className={`
                w-full p-4 text-left rounded-xl border transition-all duration-200
                ${selectedOption === option 
                  ? option === correctAnswer
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : 'bg-red-50 border-red-500 text-red-700'
                  : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option}</span>
                {selectedOption === option && (
                  option === correctAnswer 
                    ? <CheckCircle size={20} className="text-green-600" />
                    : <XCircle size={20} className="text-red-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Barra de dificuldade */}
      {isFlipped && (
        <div className="mt-8 flex items-center justify-between gap-4">
          <button className="flex-1 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition-colors flex items-center justify-center gap-2 border border-red-200">
            <XCircle size={18} />
            Muito Difícil
          </button>
          <button className="flex-1 px-4 py-3 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-xl transition-colors flex items-center justify-center gap-2 border border-yellow-200">
            <Star size={18} />
            Médio
          </button>
          <button className="flex-1 px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-colors flex items-center justify-center gap-2 border border-green-200">
            <CheckCircle size={18} />
            Fácil
          </button>
        </div>
      )}

      {/* Navegação */}
      <div className="mt-8 flex items-center justify-between">
        <button className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">
          <ChevronLeft size={18} />
          Anterior
        </button>
        <span className="text-sm text-gray-500">
          1 de 12 itens
        </span>
        <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-2 shadow-sm shadow-blue-200">
          Próximo
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}