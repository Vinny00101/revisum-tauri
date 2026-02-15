import { useEffect, useRef, useState } from "react";
import { X, Save, Plus, Trash2, FileQuestion, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/context/ToastContext";
import {
    CreateStudyItemInput,
    CreateObjectiveAnswerInput,
} from "../types/interfaces";
import { create_study_item } from "@/features/discipline/tauri/studyItem";
import { QuestionType, StudyItemType } from "@/types/types";
import { ModalStudyItemProps } from "../types/modal";

export function ModalStudyItem({
    contentId,
    isOpen,
    onClose,
    reload,
}: ModalStudyItemProps) {
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [itemType, setItemType] = useState<StudyItemType>(StudyItemType.CARD);
    const [questionType, setQuestionType] = useState<QuestionType>(
        QuestionType.OBJECTIVE
    );

    const [cardFront, setCardFront] = useState("");
    const [cardBack, setCardBack] = useState("");

    const [statementText, setStatementText] = useState("");
    const [expectedAnswer, setExpectedAnswer] = useState("");
    const [evaluationCriteria, setEvaluationCriteria] = useState("");

    const [objectiveAnswers, setObjectiveAnswers] = useState<
        CreateObjectiveAnswerInput[]
    >([]);

    const [preview, setPreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<{ bytes: number[], ext: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Resetar imagem ao fechar/abrir modal
    useEffect(() => {
        if (!isOpen) {
            setPreview(null);
            setImageFile(null);
        }
    }, [isOpen]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPreview(URL.createObjectURL(file));

        const arrayBuffer = await file.arrayBuffer();
        const bytes = Array.from(new Uint8Array(arrayBuffer));
        const ext = file.name.split('.').pop() || "png";

        setImageFile({ bytes, ext });
    };

    const addObjectiveAnswer = () => {
        setObjectiveAnswers((prev) => [
            ...prev,
            { text: "", image: null, is_correct: 0 },
        ]);
    };

    const removeObjectiveAnswer = (index: number) => {
        setObjectiveAnswers((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            let payload: CreateStudyItemInput;

            console.log(contentId);

            if (itemType === StudyItemType.CARD) {
                payload = {
                    content_id: contentId,
                    item_type: StudyItemType.CARD,
                    card: {
                        front: cardFront,
                        back: cardBack,
                    },
                    question: null,
                };
            } else {
                payload = {
                    content_id: contentId,
                    item_type: StudyItemType.QUESTION,
                    card: null,
                    question: {
                        question_type: questionType,
                        statement_text: statementText,
                        question_img_bytes: imageFile ? imageFile.bytes : null,
                        question_img_extension: imageFile ? imageFile.ext : null,
                        objective_answers:
                            questionType === QuestionType.OBJECTIVE
                                ? objectiveAnswers
                                : null,
                        expected_answer:
                            questionType === QuestionType.DISCURSIVE
                                ? expectedAnswer
                                : null,
                        evaluation_criteria:
                            questionType === QuestionType.DISCURSIVE
                                ? evaluationCriteria
                                : null,
                    },
                };
            }

            const result = await create_study_item(payload);

            if (!result.code) {
                showToast({ type: "error", message: result.message });
            } else {
                showToast({ type: "success", message: result.message });
                reload();
                onClose();
            }

        } catch (err: any) {
            showToast({ type: "error", message: "Erro ao criar item de estudo: " + err });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-hidden overscroll-none"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-white rounded-2xl shadow-xl w-500 max-w-lg overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between ">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    {itemType === StudyItemType.CARD ? (
                                        <FileText size={20} className="text-blue-600" />
                                    ) : (
                                        <FileQuestion size={20} className="text-blue-600" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">Novo Item de Estudo</h2>
                                    <p className="text-sm text-gray-500">
                                        {itemType === StudyItemType.CARD
                                            ? "Crie um novo card para estudo"
                                            : "Crie uma nova questão para prática"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="p-6 space-y-6">
                            {/* Tipo de Item */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Item *
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setItemType(StudyItemType.CARD)}
                                        className={`px-2 py-2 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${itemType === StudyItemType.CARD
                                            ? "border-blue-500 bg-blue-50 text-blue-700"
                                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                            }`}
                                    >
                                        <FileText size={18} />
                                        Card
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setItemType(StudyItemType.QUESTION)}
                                        className={`px-2 py-2 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${itemType === StudyItemType.QUESTION
                                            ? "border-blue-500 bg-blue-50 text-blue-700"
                                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                            }`}
                                    >
                                        <FileQuestion size={18} />
                                        Questão
                                    </button>
                                </div>
                            </div>

                            {/* CARD */}
                            {itemType === StudyItemType.CARD && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            Frente do Card *
                                        </label>
                                        <textarea
                                            placeholder="Ex: O que é JavaScript?"
                                            value={cardFront}
                                            onChange={(e) => setCardFront(e.target.value)}
                                            className="w-full px-4 py-3 model-input"
                                            rows={3}
                                            required
                                            autoFocus
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            Verso do Card *
                                        </label>
                                        <textarea
                                            placeholder="Ex: JavaScript é uma linguagem de programação..."
                                            value={cardBack}
                                            onChange={(e) => setCardBack(e.target.value)}
                                            className="w-full px-4 py-3 model-input"
                                            rows={4}
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {/* QUESTION */}
                            {itemType === StudyItemType.QUESTION && (
                                <div className="space-y-6 max-h-100 overflow-y-auto border-t p-2 border-gray-200">
                                    {/* Upload de Imagem para a Questão */}
                                    <div className="mt-4">
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                                            Imagem da Questão (opcional)
                                        </label>

                                        <div className="flex-col items-center gap-4">
                                            {preview ? (
                                                <div className="relative w-full h-40 rounded-lg border overflow-hidden bg-gray-50">
                                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => { setPreview(null); setImageFile(null); }}
                                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="w-full h-40 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-all"
                                                >
                                                    <Plus size={24} />
                                                    <span className="text-[10px] font-medium">Add Imagem</span>
                                                </button>
                                            )}

                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500">A imagem aparecerá acima do enunciado durante o estudo.</p>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                    accept="image/*"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Tipo de Questão */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            Tipo de Questão *
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setQuestionType(QuestionType.OBJECTIVE)}
                                                className={`px-2 py-2 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${questionType === QuestionType.OBJECTIVE
                                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                    }`}
                                            >
                                                Objetiva
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setQuestionType(QuestionType.DISCURSIVE)}
                                                className={`px-2 py-2 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${questionType === QuestionType.DISCURSIVE
                                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                    }`}
                                            >
                                                Discursiva
                                            </button>
                                        </div>
                                    </div>

                                    {/* Enunciado */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            Enunciado *
                                        </label>
                                        <textarea
                                            placeholder="Ex: Qual a principal causa da Revolução Francesa?"
                                            value={statementText}
                                            onChange={(e) => setStatementText(e.target.value)}
                                            className="w-full px-4 py-3 model-input"
                                            rows={2}
                                            required
                                            autoFocus
                                        />
                                    </div>

                                    {/* Questão Objetiva */}
                                    {questionType === QuestionType.OBJECTIVE && (
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="text-sm font-medium text-gray-700">
                                                    Alternativas *
                                                </label>
                                                <span className="text-xs text-gray-500">
                                                    {objectiveAnswers.length} de no mínimo 2
                                                </span>
                                            </div>

                                            <div className="space-y-3">
                                                {objectiveAnswers.map((ans, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                        <div className="flex-1">
                                                            <input
                                                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                                placeholder={`Alternativa ${i + 1}`}
                                                                value={ans.text}
                                                                onChange={(e) => {
                                                                    const copy = [...objectiveAnswers];
                                                                    copy[i].text = e.target.value;
                                                                    setObjectiveAnswers(copy);
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setObjectiveAnswers((prev) =>
                                                                        prev.map((a, idx) => ({
                                                                            ...a,
                                                                            is_correct: idx === i ? 1 : 0,
                                                                        }))
                                                                    );
                                                                }}
                                                                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${ans.is_correct === 1
                                                                    ? "bg-green-100 text-green-700 border border-green-300"
                                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300"
                                                                    }`}
                                                            >
                                                                Correta
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeObjectiveAnswer(i)}
                                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                disabled={objectiveAnswers.length <= 2}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={addObjectiveAnswer}
                                                className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                                            >
                                                <Plus size={16} />
                                                Adicionar alternativa
                                            </button>
                                        </div>
                                    )}

                                    {/* Questão Discursiva */}
                                    {questionType === QuestionType.DISCURSIVE && (
                                        <div className="space-y-6">
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                                    Resposta Esperada *
                                                </label>
                                                <textarea
                                                    placeholder="Ex: A principal causa foi a desigualdade social, agravada pela..."
                                                    value={expectedAnswer}
                                                    onChange={(e) => setExpectedAnswer(e.target.value)}
                                                    className="w-full px-4 py-3 model-input"
                                                    rows={2}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                                    Critérios de Avaliação (opcional)
                                                </label>
                                                <textarea
                                                    placeholder="Ex: - Menção à desigualdade social&#10;- Crise econômica&#10;- Privilégios sociais."
                                                    value={evaluationCriteria}
                                                    onChange={(e) => setEvaluationCriteria(e.target.value)}
                                                    className="w-full px-4 py-3 model-input"
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Rodapé */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={
                                        isSubmitting ||
                                        (itemType === StudyItemType.CARD && (!cardFront.trim() || !cardBack.trim())) ||
                                        (itemType === StudyItemType.QUESTION &&
                                            (!statementText.trim() ||
                                                (questionType === QuestionType.OBJECTIVE && objectiveAnswers.length < 2) ||
                                                (questionType === QuestionType.DISCURSIVE && !expectedAnswer.trim())))
                                    }
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Criando...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Criar Item
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
