import { createContext, useContext, useState } from "react";

interface Toast {
  type: MessageType;
  message: string;
}

interface ToastContextType {
  toast: Toast | null;
  showToast: (toast: Toast) => void;
  clearToast: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);


export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);

  return (
    <ToastContext.Provider
      value={{
        toast,
        showToast: setToast,
        clearToast: () => setToast(null),
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}