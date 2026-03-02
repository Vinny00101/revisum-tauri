import React from 'react';
import { Clock, CheckCircle2, AlertCircle, History } from "lucide-react";
import { formatDate } from '@/util/FormatData';

// 1. Definição da Interface baseada no seu Struct do Rust
interface ReviewLog {
  id: number;
  session_id: number;
  user_id: number;
  study_item_id: number;
  item_type: string;
  evaluation: string;
  time_spent: number | null;
  review_time: string;
}

interface RecentActivityProps {
  logs: ReviewLog[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ logs }) => {

  // Sub-componente para os Badges de dificuldade
  const EvaluationBadge = ({ evaluation }: { evaluation: string }) => {
    const config: Record<string, { style: string; text: string }> = {
      "EASY": {style: "bg-green-100 text-green-700 border-green-200", text: "Fácil"},
      "MEDIUM": {style: "bg-yellow-100 text-yellow-700 border-yellow-200", text: "Médio"},
      "HARD": {style:"bg-amber-100 text-orange-700 border-orange-200", text: "Difícil"},
      "WRONG": {style:"bg-red-100 text-red-700 border-red-200", text: "Errado"},
    };

    const label = evaluation.toUpperCase();

    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${config[label].style || "bg-gray-100 text-gray-600"}`}>
        {config[label].text || label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <History size={20} className="text-blue-600" />
          </div>
          <h3 className="font-bold text-gray-800">Atividade Recente</h3>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
          Últimas 10 revisões
        </span>
      </div>

      {/* Lista de Logs */}
      <div className="space-y-3">
        {logs && logs.length > 0 ? (
          logs.slice(0, 10).map((log) => (
            <div 
              key={log.id} 
              className="group flex items-center justify-between p-3 rounded-xl border border-gray-50 hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                {/* Ícone baseado no tipo de item */}
                <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                  {log.item_type.toUpperCase() === "CARD" ? (
                    <CheckCircle2 size={18} className="text-indigo-500" />
                  ) : (
                    <AlertCircle size={18} className="text-amber-500" />
                  )}
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-700">
                      {log.item_type} <span className="text-gray-400 font-normal">#{log.study_item_id}</span>
                    </p>
                    <EvaluationBadge evaluation={log.evaluation} />
                  </div>
                  
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium">
                      <Clock size={12} className="text-gray-300" />
                      {log.time_spent ? `${log.time_spent}s gastos` : "Tempo não reg."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data à Direita */}
              <div className="text-right">
                <p className="text-[11px] font-bold text-gray-400 group-hover:text-blue-500 transition-colors">
                  {formatDate(log.review_time)}
                </p>
              </div>
            </div>
          ))
        ) : (
          /* Estado Vazio */
          <div className="h-32 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-2">
            <History size={24} className="opacity-20" />
            <span className="text-sm font-medium">Nenhuma atividade encontrada</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;