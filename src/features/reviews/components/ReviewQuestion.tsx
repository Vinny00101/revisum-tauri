import { useState } from "react";
import { CheckCircle, HelpCircle, MessageSquareText, X, Maximize2, ChevronLeft, ChevronRight, XCircle, Flame, Star } from "lucide-react";
import { QuestionType } from "@/types/types";
import { convertFileSrc } from "@tauri-apps/api/core";
import { QuestionFullResponse } from "@/features/discipline";
import { ReviewDifficulty } from "../types/ReviewDifficulty";
import { useToast } from "@/context/ToastContext";
import { save_item_review, save_item_review_question_obj } from "@/tauri/session";

interface ReviewQuestionProps {
    sessionId: number;
    data: QuestionFullResponse;
    onNext: () => void;
    onPrevious: () => void;
    currentIndex: number;
    totalItems: number;
    onFinish: (id: number, difficulty_easy?: boolean) => void;
    isLocked?: boolean;
}

export function ReviewQuestion({ sessionId, data, onNext, onPrevious, currentIndex, totalItems, onFinish, isLocked }: ReviewQuestionProps) {
    const { question, objective_answers, discursive_response } = data;

    // Estados para controle da resposta
    const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
    const [discursiveInput, setDiscursiveInput] = useState("");
    const [showFeedback, setShowFeedback] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    const [isImageOpen, setIsImageOpen] = useState(false);

    const isObjective = question.question_type === QuestionType.OBJECTIVE;
    const imageSrc = question.statement_image ? convertFileSrc(question.statement_image) : null;

    const handleObjectiveSubmit = async (optionId: number) => {
        if (isLocked || showFeedback || isSubmitting) return;

        setIsSubmitting(true);  
        setShowFeedback(true);
        try {
            setSelectedOptionId(optionId);

            await save_item_review_question_obj(sessionId, question.id, "OBJECTIVE", optionId);

            onFinish(question.id);

        } catch (error) {
            showToast({ type: "error", message: "Erro ao salvar: " + error });
            setSelectedOptionId(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handler para confirmar que escreveu a DISCURSIVA
    const handleConfirmDiscursive = () => {
        if (isLocked) return;
        if (!discursiveInput.trim()) return;
        setShowFeedback(true);
    };

    const handleDiscursiveEvaluation = async (difficulty: ReviewDifficulty) => {
        if (isSubmitting || isLocked) return;

        setIsSubmitting(true);
        try {
            await save_item_review(sessionId, question.id, "DISCURSIVE", difficulty);

            onFinish(question.id, difficulty === "EASY");

            setTimeout(() => {
                onNext?.();
            }, 400);
        } catch (error) {
            showToast({ type: "error", message: "Erro ao salvar: " + error });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 pb-12">
            {/* MODAL DE ZOOM DA IMAGEM */}
            {isImageOpen && imageSrc && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setIsImageOpen(false)}
                >
                    <button
                        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        onClick={() => setIsImageOpen(false)}
                    >
                        <X size={24} />
                    </button>

                    <img
                        src={imageSrc}
                        alt="Enunciado ampliado"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                    />

                    <p className="absolute bottom-6 text-white/50 text-sm font-medium">
                        Clique em qualquer lugar para fechar
                    </p>
                </div>
            )}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

                {/* Header da Questão */}
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <span className="p-2 bg-purple-100 rounded-lg text-purple-600">
                            {isObjective ? <HelpCircle size={18} /> : <MessageSquareText size={18} />}
                        </span>
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                            Questão {isObjective ? "Objetiva" : "Discursiva"}
                        </span>
                    </div>
                    <span className="text-xs font-bold text-gray-400">
                        {currentIndex + 1} / {totalItems}
                    </span>
                </div>

                {/* Enunciado e Imagem */}
                <div className="p-8">
                    {imageSrc && (
                        <div
                            className="relative mb-6 rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 group cursor-zoom-in"
                            onClick={() => setIsImageOpen(true)}
                        >
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                                <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" size={32} />
                            </div>
                            <img
                                src={imageSrc}
                                alt="Enunciado"
                                className="max-h-64 mx-auto object-contain p-2 transition-transform duration-300 group-hover:scale-[1.02]"
                            />
                        </div>
                    )}

                    <h2 className="text-xl md:text-2xl text-gray-800 font-medium leading-relaxed mb-8">
                        {question.statement_text}
                    </h2>

                    {/* ÁREA DE RESPOSTA: OBJETIVA */}
                    {isObjective ? (
                        <div className="grid gap-3">
                            {objective_answers?.map((opt) => {
                                const isSelected = selectedOptionId === opt.id;
                                const showCorrect = showFeedback && opt.is_correct;
                                const showWrong = showFeedback && isSelected && !opt.is_correct;

                                let buttonStyle = "border-gray-100 bg-white hover:border-purple-200";
                                if (showFeedback) {
                                    if (showCorrect) buttonStyle = "border-green-500 bg-green-50 text-green-700";
                                    else if (isSelected) buttonStyle = "border-red-500 bg-red-50 text-red-700";
                                } else if (isSelected) {
                                    buttonStyle = "border-purple-500 bg-purple-50 text-purple-700 shadow-md";
                                }

                                return (
                                    <button
                                        key={opt.id}
                                        disabled={showFeedback || isSubmitting}
                                        onClick={() => handleObjectiveSubmit(opt.id)}
                                        className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 text-left ${buttonStyle}`}
                                    >

                                        <span className="flex-1 font-medium">{opt.text}</span>
                                        {showCorrect && <CheckCircle size={20} />}
                                        {showWrong && <XCircle size={20} />}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        /* MODO DISCURSIVO */
                        <div className="space-y-4">
                            <textarea
                                disabled={isLocked || showFeedback}
                                value={discursiveInput}
                                onChange={(e) => setDiscursiveInput(e.target.value)}
                                placeholder="Escreva sua resposta aqui..."
                                className="w-full p-4 rounded-xl border-2 border-gray-100 min-h-37.5 focus:border-blue-500 outline-none"
                            />

                            {!showFeedback ? (
                                <button
                                    onClick={handleConfirmDiscursive}
                                    className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold"
                                >
                                    VER RESPOSTA PADRÃO
                                </button>
                            ) : (
                                <div className={`animate-in fade-in slide-in-from-top-2 ${showFeedback ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                                    <div className="rounded-xl space-y-6 bg-gray-900 p-4">
                                        <div>
                                            <h4 className="font-bold text-purple-600 mb-2">Resposta Correta:</h4>
                                            <p className="text-white text-sm">{discursive_response?.expected_answer}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-purple-600 mb-2">Critérios de Avaliação:</h4>
                                            <p className="text-white text-sm">{discursive_response?.evaluation_criteria}</p>
                                        </div>
                                    </div>

                                    {!isLocked && (
                                        <div className={`
                                          mt-8 grid grid-cols-4 gap-3 transition-all duration-500
                                          ${!isLocked ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
                                        `}>
                                            <button
                                                disabled={isSubmitting}
                                                onClick={() => handleDiscursiveEvaluation("WRONG")}
                                                className="cursor-pointer flex flex-col items-center gap-2 p-3 bg-white hover:bg-red-50 border border-gray-100 rounded-2xl transition-all group">
                                                <div className="p-2 bg-red-50 group-hover:bg-red-500 transition-colors rounded-xl text-red-500 group-hover:text-white">
                                                    <X size={20} />
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">Errei</span>
                                            </button>
                                            <button
                                                disabled={isSubmitting}
                                                onClick={() => handleDiscursiveEvaluation("HARD")}
                                                className="cursor-pointer flex flex-col items-center gap-2 p-3 bg-white hover:bg-amber-50 border border-gray-100 rounded-2xl transition-all group">
                                                <div className="p-2 bg-amber-50 group-hover:bg-amber-700 transition-colors rounded-xl text-amber-700 group-hover:text-white">
                                                    <Flame size={20} />
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">Difícil</span>
                                            </button>
                                            <button
                                                disabled={isSubmitting}
                                                onClick={() => handleDiscursiveEvaluation("MEDIUM")}
                                                className="cursor-pointer flex flex-col items-center gap-2 p-3 bg-white hover:bg-yellow-50 border border-gray-100 rounded-2xl transition-all group">
                                                <div className="p-2 bg-yellow-50 group-hover:bg-yellow-500 transition-colors rounded-xl text-yellow-500 group-hover:text-white">
                                                    <Star size={20} />
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">Médio</span>
                                            </button>
                                            <button
                                                disabled={isSubmitting}
                                                onClick={() => handleDiscursiveEvaluation("EASY")}
                                                className="cursor-pointer flex flex-col items-center gap-2 p-3 bg-white hover:bg-green-50 border border-gray-100 rounded-2xl transition-all group">
                                                <div className="p-2 bg-green-50 group-hover:bg-green-500 transition-colors rounded-xl text-green-500 group-hover:text-white">
                                                    <CheckCircle size={20} />
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">Fácil</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>


            </div>
            {/* Navegação Inferior */}
            <div className="mt-10 flex items-center justify-between border-t border-gray-200 pt-6">
                <button onClick={onPrevious} className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
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