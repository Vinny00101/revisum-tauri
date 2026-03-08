import { EvaluationBadge } from "@/components/EvaluationBadge";
import { ItemType } from "@/components/ItemType";
import { ReviewLog } from "@/types/interfaces";
import { formatDate } from "@/util/FormatData";
import { Book, CheckCircle2, History } from "lucide-react";
import React from "react";

interface RecentActivityProps {
    logs: ReviewLog[];
}

const LogsDashboard: React.FC<RecentActivityProps> = ({ logs }) => {

    return (
        <div className="space-y-3 p-6">
            {logs && logs.length > 0 ? (
                logs.slice(0, 5).map((log) => (
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
                                    <Book size={18} className="text-blue-500" />
                                )}
                            </div>

                            <div>
                                <div className="flex items-center gap-2">
                                    <ItemType item_type={log.item_type}/>
                                    <EvaluationBadge evaluation={log.evaluation} />
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] font-bold text-gray-400 group-hover:text-blue-500 transition-colors">
                                {formatDate(log.review_time)}
                            </p>
                        </div>
                    </div>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <History size={28} className="text-gray-300" />
                    </div>
                    <h4 className="text-[18px] font-semibold text-gray-900">Nenhuma revisão ainda</h4>
                    <p className="text-sm text-gray-500 mt-2 max-w-50 mx-auto leading-relaxed">
                        Seus registros de estudo aparecerão aqui assim que você concluir sua primeira revisão.
                    </p>
                </div>
            )}
        </div>
    );
};

export default LogsDashboard;