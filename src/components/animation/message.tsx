import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedMessageProps {
  message: { code: boolean; message: string } | null;
  onMessageClear?: () => void;
  duration?: number;
}

export default function AnimatedMessage({ 
  message, 
  onMessageClear, 
  duration = 3000 
}: AnimatedMessageProps) {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (message) {
      // Inicia animação de entrada
      setShowMessage(true);

      // Timer para animação de saída
      const exitTimer = setTimeout(() => {
        setShowMessage(false);
        
        // Remove após animação de saída
        const removeTimer = setTimeout(() => {
          if (onMessageClear) {
            onMessageClear();
          }
        }, 300); // Tempo da animação de saída
        
        return () => clearTimeout(removeTimer);
      }, duration - 300); // Subtrai o tempo da animação de saída

      return () => {
        clearTimeout(exitTimer);
      };
    }
  }, [message, duration, onMessageClear]);

  return (
    <AnimatePresence>
      {message && showMessage && (
        <div className="absolute w-full h-full flex items-end overflow-hidden overscroll-none pointer-events-none">
          <motion.p
            key={message.message}
            className={`
              w-full text-center px-4 py-2 h-fit
              ${message.code ? "bg-green-600 text-white" : "bg-red-600 text-white"}
              pointer-events-auto
            `}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {message.message}
          </motion.p>
        </div>
      )}
    </AnimatePresence>
  );
}