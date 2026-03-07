import { ChevronLeft, ChevronRight, Star, CheckCircle, HelpCircle, X, Flame } from "lucide-react";
import { useState } from "react";
import { ReviewDifficulty } from "../types/ReviewDifficulty";
import { useToast } from "@/context/ToastContext";
import { save_item_review } from "@/tauri/session";

interface ReviewCardProps {
  id: number;
  sessionId: number;
  front: string;
  back: string;
  type: "card" | "question";
  options?: string[];
  correctAnswer?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  currentIndex?: number;
  totalItems?: number;
  onFinish: (id: number, difficulty_easy: boolean) => void;
  isLocked?: boolean;
}

export function ReviewCard({
  id,
  sessionId,
  front,
  back,
  type,
  onNext,
  onPrevious,
  currentIndex = 0,
  totalItems = 0,
  onFinish,
  isLocked = false
}: ReviewCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rated, setRated] = useState(false);
  const {showToast} = useToast();

  const handleFlip = () => {
    if (type === 'card') {
      setIsFlipped(!isFlipped);
    }
  };

  const handleRate = async (difficulty: ReviewDifficulty) => {
    if (isSubmitting || rated || isLocked) return;

    setIsSubmitting(true);
    try {
      await save_item_review(sessionId, id, "CARD", difficulty);

      setRated(true);
      onFinish(id, difficulty === "EASY");

      setTimeout(() => {
        onNext?.();
      }, 400);
    } catch (error) {
      showToast({type: "error", message: "Erro ao salvar: " + error});
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      {/* Container do Card com Perspective */}
      <div className="relative h-100 w-full perspective-1000">
        <div
          onClick={handleFlip}
          className={`
            relative w-full h-full transition-all duration-700 preserve-3d cursor-pointer
            ${!rated ? 'cursor-pointer' : 'cursor-default'}
            ${isFlipped ? 'rotate-y-180' : ''}
          `}
        >
          {/* FRENTE: Pergunta */}
          <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <HelpCircle size={18} className="text-blue-600" />
                </div>
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                  {type === 'card' ? 'Flashcard' : 'Questão'}
                </span>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center overflow-y-auto">
              <h2 className="text-2xl md:text-3xl text-gray-800 font-semibold text-center leading-tight">
                {front}
              </h2>
            </div>

            <div className="mt-6 flex flex-col items-center gap-2">
              <div className="w-12 h-1 bg-gray-100 rounded-full" />
              <p className="text-xs text-gray-400 font-medium uppercase tracking-tighter text-center">
                Clique para revelar a resposta
              </p>
            </div>
          </div>

          {/* VERSO: Resposta (O rotate-y-180 aqui cancela o espelhamento do container pai) */}
          <div className="absolute inset-0 backface-hidden bg-slate-50 rounded-3xl shadow-xl border border-gray-100 p-8 rotate-y-180 flex flex-col overflow-hidden">

            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <CheckCircle size={18} className="text-green-600" />
                </div>
                <span className="text-sm font-bold text-green-700 uppercase tracking-wider">Resposta</span>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center overflow-y-auto">
              <h2 className="text-2xl md:text-3xl text-gray-800 font-semibold text-center leading-tight">
                {back}
              </h2>
            </div>

            <div className="mt-6 flex flex-col items-center gap-2">
              <div className="w-12 h-1 bg-gray-100 rounded-full" />
              <p className="text-xs text-gray-400 font-medium uppercase tracking-tighter text-center">
                Clique para revelar a resposta
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Avaliação de Dificuldade */}
      <div className={`
        mt-8 grid grid-cols-4 gap-3 transition-all duration-500
        ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
      `}>
        <button
          disabled={isSubmitting || rated}
          onClick={() => handleRate("WRONG")}
          className="cursor-pointer flex flex-col items-center gap-2 p-3 bg-white hover:bg-red-50 border border-gray-100 rounded-2xl transition-all group">
          <div className="p-2 bg-red-50 group-hover:bg-red-500 transition-colors rounded-xl text-red-500 group-hover:text-white">
            <X size={20} />
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase">Errei</span>
        </button>
        <button
          disabled={isSubmitting || rated}
          onClick={() => handleRate("HARD")}
          className="cursor-pointer flex flex-col items-center gap-2 p-3 bg-white hover:bg-amber-50 border border-gray-100 rounded-2xl transition-all group">
          <div className="p-2 bg-amber-50 group-hover:bg-amber-700 transition-colors rounded-xl text-amber-700 group-hover:text-white">
            <Flame size={20} />
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase">Difícil</span>
        </button>
        <button
          disabled={isSubmitting || rated}
          onClick={() => handleRate("MEDIUM")}
          className="cursor-pointer flex flex-col items-center gap-2 p-3 bg-white hover:bg-yellow-50 border border-gray-100 rounded-2xl transition-all group">
          <div className="p-2 bg-yellow-50 group-hover:bg-yellow-500 transition-colors rounded-xl text-yellow-500 group-hover:text-white">
            <Star size={20} />
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase">Médio</span>
        </button>
        <button 
          disabled={isSubmitting || rated}
          onClick={() => handleRate("EASY")}
          className="cursor-pointer flex flex-col items-center gap-2 p-3 bg-white hover:bg-green-50 border border-gray-100 rounded-2xl transition-all group">
          <div className="p-2 bg-green-50 group-hover:bg-green-500 transition-colors rounded-xl text-green-500 group-hover:text-white">
            <CheckCircle size={20} />
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase">Fácil</span>
        </button>
      </div>

      {/* Navegação Inferior */}
      <div className="mt-10 flex items-center justify-between border-t border-gray-200 pt-6">
        <button 
        disabled={rated || currentIndex === 0}
        onClick={onPrevious} className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
          <ChevronLeft size={28} />
        </button>

        <div className="text-center">
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
            {currentIndex + 1} de {totalItems}
          </span>
        </div>

        <button onClick={onNext} className="p-3 bg-blue-600 text-white hover:bg-blue-700 rounded-full transition-all shadow-lg shadow-blue-200">
          <ChevronRight size={28} />
        </button>
      </div>
    </div>
  );
}