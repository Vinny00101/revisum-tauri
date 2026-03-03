import { update_session } from "@/tauri/session";
import { CheckCircle } from "lucide-react";
import { useEffect, useRef } from "react";

export function SessionSummary({
    sessionId,
    total,
    correct_items,
    time,
    onExit
}: {sessionId: number, total: number, correct_items: number, time: string, onExit: (isfinished?: boolean) => void }) {
    const hasSaved = useRef(false);

    useEffect(() => {
        const saveSessionFinalData = async () => {
            if (hasSaved.current) return;
            hasSaved.current = true;

            try {
                const accuracy = total > 0 ? (correct_items / total) * 100 : 0;
            
                const endTimeIso = new Error().stack?.includes("react") 
                    ? new Date().toISOString() 
                    : new Date().toISOString(); 

                const response = await update_session(
                    sessionId,
                    total,
                    endTimeIso,
                    accuracy,
                    correct_items
                );

                if (!response.code) {
                    console.error("Erro ao salvar fim da sessão:", response.message);
                    return;
                }

                console.log("Sessão finalizada e salva com sucesso.");
            } catch (error) {
                console.error("Erro ao salvar fim da sessão:", error);
            }
        };

        saveSessionFinalData();
    }, [sessionId, total, correct_items]);
    return (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center animate-in zoom-in-95 duration-500">

            { total > 0 && (<div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
               <CheckCircle size={40} />
            </div>)}

            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sessão Finalizada!</h2>

            {total === 0 ? (
                <p className="text-gray-500 mb-8 font-medium">Nenhum item foi revisado.</p>
            ): (
                <p className="text-gray-500 mb-8 font-medium">Você revisou {total} itens com sucesso.</p>
            )}

            <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Tempo Total</p>
                    <p className="text-xl font-mono font-bold text-blue-600">{time}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Itens</p>
                    <p className="text-xl font-bold text-purple-600">{total}</p>
                </div>
            </div>

            <button
                onClick={() => onExit(true)}
                className="w-full py-4 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:scale-[1.02] transition-transform"
            >
                VOLTAR AO INÍCIO
            </button>
        </div>
    );
}