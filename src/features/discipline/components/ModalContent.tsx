import { useEffect, useState } from "react";
import { X, BookText, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/context/ToastContext";
import { CreateContentModalProps, ContentFormData } from "../types/modal";
import OrderInput from "@/components/ui/orderInput";
import { create_content } from "@/features/discipline/tauri/content";


export function ModalContent({
    id,
    disciplineId,
    title,
    isOpen,
    onClose,
    reloadTable
}: CreateContentModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState<ContentFormData>({
        title: "",
        description: "",
        display_order: 1
    });

    const { showToast } = useToast();

    useEffect(() => {
        if (!id || !isOpen) return;

        const loadContent = async () => {
            try {
                /*
                const result = await get_content(id);
        
                if (result.message.code && result.content) {
                  setFormData({
                    title: result.content.title,
                    description: result.content.description ?? "",
                    display_order: result.content.display_order
                  });
                
                } else {
                  showToast({ type: "error", message: result.message.message });
                }
                  */
            } catch (error) {
                showToast({ type: "error", message: "Erro ao carregar conteúdo" });
            }
        };

        loadContent();
    }, [id, isOpen]);

    const handleCreate = async () => {
        if (!formData.title.trim()) return;

        setIsSubmitting(true);
        try {
            
            const message = await create_content(
              disciplineId,
              formData.title,
              formData.description,
              formData.display_order
            );
    
            if (!message.code) {
              showToast({ type: "error", message: message.message });
            } else {
              showToast({ type: "success", message: message.message });
              reloadTable();
              onClose();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = async () => {
        if (!id || !formData.title.trim()) return;

        setIsSubmitting(true);
        try {
            /*
          const message = await update_content(
            id,
            formData.title,
            formData.description,
            formData.display_order
          );
    
          if (!message.code) {
            showToast({ type: "error", message: message.message });
          } else {
            showToast({ type: "success", message: message.message });
            reloadTable();
            onClose();
          }
            */
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;

        setIsDeleting(true);
        try {
            /*
          const result = await delete_content(id);
          if (!result.code) {
            showToast({ type: "error", message: result.message });
          } else {
            showToast({ type: "success", message: result.message });
            reloadTable();
            onClose();
          }
            */
        } finally {
            setIsDeleting(false);
        }
    };

    const handleChange = (field: keyof ContentFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {title !== "Excluir Conteúdo" && (
                            <>

                                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between scroll">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <BookText size={20} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                                            <p className="text-sm text-gray-500">Preencha os dados do conteúdo da disciplina</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            titulo do conteudo *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => handleChange("title", e.target.value)}
                                            placeholder="Ex: Regra de três simples, definição de derivada, etc."
                                            className="w-full px-4 py-3 model-input"
                                            required
                                            autoFocus
                                        />
                                    </div>

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



                                    <OrderInput
                                        label="Ordem do Conteúdo *"
                                        value={formData.display_order}
                                        onChange={(e) => handleChange("display_order", e)}
                                        min={1}
                                        max={20}
                                    />

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
                                            disabled={!formData.title.trim() || !formData.display_order || isSubmitting}
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
                                                    {id ? "Salvar Alterações" : "Criar Conteúdo"}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {title === "Excluir Conteúdo" && (
                            <>
                                <div className="p-6">
                                    <p className="mb-4">
                                        Tem certeza que deseja excluir este conteúdo?
                                    </p>
                                    <div className="flex justify-end gap-2">
                                        <button onClick={onClose}>Cancelar</button>
                                        <button
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                            className="bg-red-600 text-white px-4 py-2 rounded-lg"
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
