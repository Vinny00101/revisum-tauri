import React from 'react';
import { CheckCircle2, AlertCircle, History } from "lucide-react";
import { formatDate } from '@/util/FormatData';
import { ReviewLog } from '@/types/interfaces';
import { EvaluationBadge } from '@/components/EvaluationBadge';
import { ItemType } from '@/components/ItemType';

interface RecentActivityProps {
  logs: ReviewLog[];
  limit?: number;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ logs, limit = 10 }) => {
  // Garantimos que o limite seja no mínimo 10
  const displayLimit = Math.max(limit, 6);

  return (
    <div className={`flex flex-col h-full bg-white rounded-2xl space-y-3 shadow-sm border border-gray-100 p-6`}>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <History size={20} className="text-blue-600" />
          </div>
          <h3 className="font-bold text-gray-800">Atividade Recente</h3>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
          Últimas {displayLimit} revisões
        </span>
      </div>

      {/* Lista de Logs */}
      <div className="flex-1 space-y-3">
        {logs && logs.length > 0 ? (
          // Usamos o displayLimit aqui
          logs.slice(0, displayLimit).map((log) => (
            <div 
              key={log.id} 
              className="group flex items-center justify-between p-3 rounded-xl border border-gray-50 hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                  {log.item_type.toUpperCase() === "CARD" ? (
                    <CheckCircle2 size={18} className="text-indigo-500" />
                  ) : (
                    <AlertCircle size={18} className="text-amber-500" />
                  )}
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <ItemType item_type={log.item_type}/>
                    <EvaluationBadge evaluation={log.evaluation} />
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
          <div className={`h-full bg-gray-50/50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-2`}>
            <History size={24} className="opacity-20" />
            <span className="text-sm font-medium">Nenhuma atividade encontrada</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;