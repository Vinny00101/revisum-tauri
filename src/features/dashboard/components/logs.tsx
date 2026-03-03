import { EvaluationBadge } from "@/components/EvaluationBadge";
import { ReviewLog } from "@/types/interfaces";
import { formatDate } from "@/util/FormatData";
import { AlertCircle, CheckCircle2 } from "lucide-react";
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
                                    <AlertCircle size={18} className="text-amber-500" />
                                )}
                            </div>

                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-gray-700">
                                        {log.item_type}
                                    </p>
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
                <div></div>
            )}
        </div>
    );
};

export default LogsDashboard;