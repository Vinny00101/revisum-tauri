import { useToast } from "@/context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { delete_study_item } from "../../tauri/studyItem";
import { Trash2, X } from "lucide-react";

export default function ButtonDelete({
    id,
    title,
    contentid,
    reloadTable,
    onClose,
}: {
    id: number;
    contentid: number;
    title: string;
    onClose: () => boolean;
    reloadTable: () => void;
}) {
    const [isShowDropdown, setIsShowDropdown] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { showToast } = useToast();


    const handleDelete = async () => {
        if (!id) return;

        setIsDeleting(true);
        try {
            const result = await delete_study_item(id, contentid);
            if (!result.code) {
                showToast({ type: "error", message: result.message });
            } else {
                showToast({ type: "success", message: result.message });
                reloadTable();
                setIsShowDropdown(onClose());
            }
        } finally {
            setIsDeleting(false);
        }
    };

    if (isShowDropdown) {
        return (
            <AnimatePresence>
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
                        <div>
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <Trash2 size={20} className="text-red-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                                        <p className="text-sm text-gray-500">
                                            Tem certeza que deseja excluir este conteúdo? Esta ação não pode ser desfeita.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsShowDropdown(onClose())}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 flex justify-end gap-2">
                                <button
                                    onClick={() => setIsShowDropdown(onClose())}
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
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        )
    }


    return (
        <button
            onClick={() => setIsShowDropdown(!isShowDropdown)}
            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
            title="Excluir conteúdo"
        >
            <Trash2 size={18} />
        </button>
    )
}