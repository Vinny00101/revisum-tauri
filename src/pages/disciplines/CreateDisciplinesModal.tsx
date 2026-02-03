import { useState } from "react";
import { X, BookText, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CreateDisciplineModalProps from "@/types/Create";
import { useTauri } from "@/context/TauriContext";
import DisciplineFormData from "@/types/FormData";
import { useToast } from "@/context/ToastContext";

export default function CreateDisciplineModal({
    isOpen,
    onClose
}: CreateDisciplineModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {discService} = useTauri();
    const [formData, setFormData] = useState<DisciplineFormData>({
        name: "",
        description: "",
    });

    const {showToast} = useToast();

    const handleSubmit = async () => {
        if (!formData.name.trim()) return;

        setIsSubmitting(true);
        try {
            const message = await discService.createDisciplineService(formData.name, formData.description);
            if(!message.code){
                showToast({type: "error", message: message.message});
            }else{
                showToast({type: "success", message: message.message});
                setFormData({ name: "", description: ""});
                onClose();
            }
        } catch (error) {
            showToast({type: "error", message: "Erro ao criar disciplina"});
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: keyof DisciplineFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={onClose}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <BookText size={20} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">Nova Disciplina</h2>
                                        <p className="text-sm text-gray-500">Preencha os dados da disciplina</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        Nome da Disciplina *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleChange("name", e.target.value)}
                                        placeholder="Ex: Matemática, Programação, História..."
                                        className="w-full px-4 py-3 model-input"
                                        required
                                        autoFocus
                                    />
                                </div>

                                {/* Descrição */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        Descrição (opcional)
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleChange("description", e.target.value)}
                                        placeholder="Breve descrição sobre o que será estudado..."
                                        rows={3}
                                        className="w-full px-4 py-3 model-input "
                                    />
                                </div>

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
                                        disabled={!formData.name.trim() || isSubmitting}
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
                                                Criar Disciplina
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}