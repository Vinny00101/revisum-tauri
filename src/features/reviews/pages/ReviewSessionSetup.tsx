import { Brain, ListChecks, FileText, ArrowLeft, Play } from "lucide-react";
import { Content, Discipline, StudyItemFullResponse } from "@/features/discipline";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { QuestionType, StudyItemType } from "@/types/types";

// Alinhado com o seu banco de dados
export type SessionType = "CARD" | "OBJECTIVE" | "DISCURSIVE";

export function ReviewSessionSetup({
  content,
  discipline,
  items,
  onStart,
}: {
  content: Content;
  discipline: Discipline;
  items: StudyItemFullResponse[];
  onStart: (config: { type: SessionType }) => void;
}) {
  const availableTypes = useMemo(() => {
    return {
      hasCards: items.some(i => i.item_type === StudyItemType.CARD),
      hasObjective: items.some(i => 
        i.item_type === StudyItemType.QUESTION && 
        i.question?.question.question_type === QuestionType.OBJECTIVE
      ),
      hasDiscursive: items.some(i => 
        i.item_type === StudyItemType.QUESTION && 
        i.question?.question.question_type === QuestionType.DISCURSIVE
      ),
    };
  }, [items]);

  const initialType = useMemo(() => {
    if (availableTypes.hasCards) return "CARD";
    if (availableTypes.hasObjective) return "OBJECTIVE";
    return "DISCURSIVE";
  }, [availableTypes]);

  const [selectedType, setSelectedType] = useState<SessionType>(initialType as SessionType);
  const navigate = useNavigate();



  const sessionOptions = [
    {
      id: "CARD",
      label: "Flashcards",
      description: "Memorização ativa com repetição espaçada.",
      icon: Brain,
      color: "text-purple-500",
      bg: "bg-purple-50",
      border: "border-purple-100",
      available: availableTypes.hasCards,
    },
    {
      id: "OBJECTIVE",
      label: "Questões Objetivas",
      description: "Simulado com alternativas e cálculo de acurácia.",
      icon: ListChecks,
      color: "text-blue-500",
      bg: "bg-blue-50",
      border: "border-blue-100",
      available: availableTypes.hasObjective,
    },
    {
      id: "DISCURSIVE",
      label: "Questões Discursivas",
      description: "Prática de escrita com autoavaliação (Easy/Hard).",
      icon: FileText,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      available: availableTypes.hasDiscursive,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <button
          onClick={() => navigate("/reviews")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition-colors font-medium text-sm"
        >
          <ArrowLeft size={18} /> Voltar para conteúdos
        </button>
        <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold uppercase tracking-wider">
              {discipline.name}
            </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">
          {content.title}
        </h1>
        <p className="text-gray-600 mt-2 max-w-2xl">
          {content.description || "Escolha o método de estudo para esta sessão."}
        </p>
      </div>

      {/* Seleção de Tipo de Sessão */}
      <div className="grid grid-cols-1 gap-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
          Selecione o modo de estudo
        </h3>
        
        {sessionOptions.filter(opt => opt.available).map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelectedType(opt.id as SessionType)}
            className={`
              flex items-center gap-4 p-3 rounded-2xl border-2 transition-all text-left
              ${selectedType === opt.id 
                ? "border-gray-900 bg-white shadow-md scale-[1.01]" 
                : "border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200"}
            `}
          >
            <div className={`p-4 rounded-xl ${opt.bg} ${opt.color}`}>
              <opt.icon size={28} />
            </div>
            
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-lg">{opt.label}</h4>
              <p className="text-gray-500 text-sm">{opt.description}</p>
            </div>

            <div className={`
              w-6 h-6 rounded-full border-2 flex items-center justify-center
              ${selectedType === opt.id ? "border-gray-900" : "border-gray-300"}
            `}>
              {selectedType === opt.id && <div className="w-3 h-3 bg-gray-900 rounded-full" />}
            </div>
          </button>
        ))}
      </div>

      {/* Botão de Início */}
      <button
        onClick={() => onStart({ type: selectedType })}
        className="w-full mt-8 py-5 bg-gray-900 text-white font-bold rounded-2xl shadow-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-3 group"
      >
        <Play size={20} className="group-hover:translate-x-1 transition-transform" fill="currentColor" />
        INICIAR REVISÃO ALEATÓRIA
      </button>

      <p className="text-center text-gray-400 text-xs mt-6">
        * A ordem das questões será definida aleatoriamente para melhor retenção.
      </p>
    </div>
  );
}