import { useEffect, useState, useRef } from "react";
import { X, User2Icon, Save, Camera, Mail, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/context/ToastContext";
import { updateUser } from "@/tauri/user";
import { User } from "@/types/models";
import { convertFileSrc } from "@tauri-apps/api/core";

interface ModalUserProps {
    currentUserData: User
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ModalUser({
    currentUserData,
    isOpen,
    onClose,
    onSuccess
}: ModalUserProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });
    
    // Estados para a imagem
    const [preview, setPreview] = useState<string | null>(null);
    const [previewPath, setPreviewPath] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<{ bytes: number[], ext: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { showToast } = useToast();

    // Resetar/Carregar dados ao abrir
    useEffect(() => {
        if (isOpen) {
            setFormData({
                username: currentUserData.username,
                email: currentUserData.email,
                password: "",
            });
            setPreviewPath(currentUserData.avatar_path || null);
            setImageFile(null);
        }
    }, [isOpen, currentUserData]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPreview(URL.createObjectURL(file));

        const arrayBuffer = await file.arrayBuffer();
        const bytes = Array.from(new Uint8Array(arrayBuffer));
        const ext = file.name.split('.').pop() || "png";

        setImageFile({ bytes, ext });
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await updateUser({
                username: formData.username,
                email: formData.email,
                password: formData.password || null,
                avatar_bytes: imageFile?.bytes || null,
                avatar_extension: imageFile?.ext || null
            });

            if (response.code) {
                showToast({ type: "success", message: response.message });
                onSuccess();
                onClose();
            } else {
                showToast({ type: "error", message: response.message });
            }
        } catch (err) {
            showToast({ type: "error", message: "Erro ao atualizar perfil" });
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
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <User2Icon size={20} className="text-indigo-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-800">Editar Perfil</h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-6 space-y-5">
                            {/* Avatar Upload */}
                            <div className="flex flex-col items-center gap-3">
                                <div 
                                    className="relative w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:border-indigo-400 transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {preview ? (
                                        <img src={preview} className="w-full h-full object-cover" alt="Avatar" />
                                    ) : previewPath ? (
                                        <img src={convertFileSrc(previewPath)} className="w-full h-full object-cover" alt="Avatar" />
                                    ) : (
                                        <Camera className="text-gray-400" size={32} />
                                    )}
                                    <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Camera className="text-white" size={24} />
                                    </div>
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleFileChange} 
                                />
                                <span className="text-xs text-gray-500">Clique para alterar a foto</span>
                            </div>

                            {/* Username */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Nome de Usuário</label>
                                <div className="relative">
                                    <User2Icon className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        className="w-full pl-10 pr-4 py-2 model-input rounded-lg outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">E-mail</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full pl-10 pr-4 py-2 model-input rounded-lg  outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Nova Senha (opcional)</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        placeholder="Deixe em branco para manter a atual"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className="w-full pl-10 pr-4 py-2 model-input rounded-lg outline-none"
                                    />
                                </div>
                            </div>

                            {/* Botões */}
                            <div className="flex items-center justify-between gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                                    Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}