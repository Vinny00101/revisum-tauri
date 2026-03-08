import { Discipline } from "@/features/discipline";
import { BarChart3, BookOpen, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function DisciplineProgress({ disciplines }: { disciplines: Discipline[] }) {
    const Navigate = useNavigate();

    return (
        <>
            {/* Progresso por disciplina */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <BarChart3 size={18} className="text-blue-500" />
                    Progresso por disciplina
                </h3>



                <div className="space-y-4">
                    {disciplines && disciplines.length > 0 ? (disciplines.map((d) => ( d.progress_percent > 0 && 
                        <div key={d.id}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">{d.name}</span>
                                <span className="font-medium text-gray-900">{d.progress_percent}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full w-3/4 bg-linear-to-r rounded-full to-blue-500 from-blue-300`} style={{ width: `${d.progress_percent}%` }} />
                            </div>
                        </div>
                    ))) : (
                        <div className="flex flex-col items-center justify-center py-16 px-4">
                            <div className="w-15 h-15 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                                <BookOpen size={30} className="text-blue-500 opacity-80" />
                            </div>

                            <div className="text-center max-w-xs">
                                <h3 className="text-sm font-bold text-gray-900 mb-2">
                                    Sua jornada começa aqui!
                                </h3>
                                <p className="text-gray-500 leading-relaxed text-sm">
                                    Parece que você ainda não tem disciplinas. Adicione uma para começar a organizar seus estudos.
                                </p>
                            </div>

                            <button
                                onClick={() => Navigate('/disciplines')}
                                className="mt-8 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
                            >
                                <Plus size={20} />
                                Adicionar Disciplina
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </>
    )
}