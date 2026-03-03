import { Brain, Clock, X } from "lucide-react";
import { useReviewSession } from "@/hooks/useSession";
import { Content, Discipline, StudyItemFullResponse } from "@/features/discipline";
import { StudyItemType } from "@/types/types";
import { ReviewCard } from "./ReviewCard";
import { ReviewQuestion } from "./ReviewQuestion";
import { SessionSummary } from "./SessionSummary";
import { SessionType } from "../pages/ReviewSessionSetup";


interface Props {
  content: Content;
  discipline: Discipline;
  items: StudyItemFullResponse[];
  sessionType: SessionType;
  sessionId: number;
  onExit: () => void;
}

export function ReviewSession({ content, discipline, items, sessionType, sessionId, onExit }: Props) {
  const {
    seconds,
    formatTime,
    currentIndex,
    sessionItems,
    currentItem,
    progress,
    prevItem,
    nextItem,
    answeredIds,
    markAsFinished,
    isFinished,
  } = useReviewSession(items, sessionType);

  // Se não houver itens após o filtro
  if (sessionItems.length === 0) {
    return <div>Nenhum item encontrado para este modo de revisão.</div>;
  }


  // Se a sessão acabou, mostra o resumo
  if (isFinished) {
    return (
      <div className="flex items-center justify-center px-4">
        <SessionSummary
          sessionId={sessionId}
          correct_items={answeredIds.size}
          total={currentIndex + 1}
          time={formatTime(seconds)}
          onExit={onExit}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="w-full flex-col justify-center items-center">

        {/* Header da sessão */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onExit}
                className="group flex items-center gap-2 p-2 px-3 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg transition-all duration-200 border border-transparent hover:border-red-100"
              >
                <X size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Sair</span>
              </button>
              <div className="h-8 w-px bg-gray-200 mx-1" />
              
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-200">
                <Brain size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 line-clamp-1">{content.title}</h1>
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                  {discipline.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl">
                <Clock size={16} className="text-blue-600" />
                <span className="text-sm font-mono font-bold text-gray-700">
                  {formatTime(seconds)}
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-gray-500 font-medium italic">Foco total agora...</span>
              <span className="font-bold text-gray-900">
                Item {currentIndex + 1} de {sessionItems.length}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-br from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {currentItem.item_type === StudyItemType.CARD && currentItem.card && (
          <ReviewCard
            key={currentIndex}
            sessionId={sessionId}
            id={currentItem.id}
            front={currentItem.card.front}
            back={currentItem.card.back}
            type="card"
            totalItems={sessionItems.length}
            currentIndex={currentIndex}
            onNext={nextItem}
            onPrevious={prevItem}
            isLocked={answeredIds.has(currentItem.id)}
            onFinish={markAsFinished}
          />
        )}

        {currentItem.item_type === StudyItemType.QUESTION && currentItem.question && (
          <ReviewQuestion
            key={currentIndex}
            sessionId={sessionId}
            data={currentItem.question}
            currentIndex={currentIndex}
            totalItems={sessionItems.length}
            onNext={nextItem}
            onPrevious={prevItem}
            isLocked={answeredIds.has(currentItem.id)}
            onFinish={markAsFinished}
          />
        )}

        {/* Footer info */}
        <div className="mt-8 text-center flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Sessão ativa
          </div>
        </div>
      </div>
    </div>
  );
}