import { useEffect, useState } from "react";
import { X, BookText, Save, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/context/ToastContext";
import { CreateDisciplineModalProps, DisciplineFormData } from "../types/modal";
import { create_discipline, delete_discipline, get_discipline, update_discipline } from "@/tauri/discipline";

export function ModalDisciplina({
    id,
    title,
    isOpen,
    onClose,
    reloadTable
}: CreateDisciplineModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [formData, setFormData] = useState<DisciplineFormData>({ name: "", description: "", });

    const { showToast } = useToast();

    useEffect(() => {
        if (!id || !isOpen) return;

        const loadDiscipline = async () => {
            try {
                const result = await get_discipline(id);

                if (result.message.code && result.discipline) {
                    setFormData({
                        name: result.discipline.name,
                        description: result.discipline.description ?? "",
                    });
                } else {
                    showToast({ type: "error", message: result.message.message });
                }
            } catch (err) {
                showToast({ type: "error", message: "Erro ao carregar disciplina" });
            }
        };

        loadDiscipline();
    }, [id, isOpen]);

    const handleCreate = async () => {
        if (!formData.name.trim()) return;

        setIsSubmitting(true);
        try {
            const message = await create_discipline(formData.name, formData.description);
            console.log("Resposta da criação de disciplina:", message);
            if (!message.code) {
                showToast({ type: "error", message: message.message });
            } else {
                showToast({ type: "success", message: message.message });
                reloadTable();
                setFormData({ name: "", description: "" });
                onClose();
            }
        } catch (error) {
            console.log("error");
            showToast({ type: "error", message: "Erro ao criar disciplina: " + error });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = async () => {
        if (!formData.name.trim() || !id) return;
        setIsSubmitting(true);
        try {
            const message = await update_discipline(id, formData.name, formData.description);
            if (!message.code) {
                showToast({ type: "error", message: message.message });
            } else {
                showToast({ type: "success", message: message.message });
                reloadTable();
                setFormData({ name: "", description: "" });
                onClose();
            }
        } catch (error) {
            showToast({ type: "error", message: "Erro ao criar disciplina" });
        } finally {
            setIsSubmitting(false);
        }

    };

    const handleDelete = async () => {
        if (!id) return;

        setIsDeleting(true);
        try {
            const result = await delete_discipline(id);
            if (!result.code) {
                showToast({ type: "error", message: result.message });
            } else {
                showToast({ type: "success", message: result.message });
                reloadTable();
                onClose();
            }
        } catch (err) {
            showToast({ type: "error", message: "Erro ao excluir disciplina" });
            console.error(err);
        } finally {
            setIsDeleting(false);
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
                        key={`modal-${title}-${id ?? "new"}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-hidden overscroll-none"
                        onClick={onClose}
                    >
                        <motion.div
                            key={`modal-${title}-${id ?? "new"}`}
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {title != "Excluir Disciplina" && (
                                <div>
                                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <BookText size={20} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
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

                                    <form onSubmit={id ? handleEdit : handleCreate} className="p-6 space-y-6">
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
                                                onClick={id ? handleEdit : handleCreate}
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
                                                        {id ? "Salvar Alterações" : "Criar Disciplina"}
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {title === "Excluir Disciplina" && (
                                <div>
                                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-red-100 rounded-lg">
                                                <Trash2 size={20} className="text-red-600" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                                                <p className="text-sm text-gray-500">
                                                    Tem certeza que deseja excluir esta disciplina? Esta ação não pode ser desfeita.
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

                                    <div className="p-6 flex justify-end gap-2">
                                        <button
                                            onClick={onClose}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                            disabled={isDeleting}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                "Excluir"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}