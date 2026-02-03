import { AnimatePresence, motion } from "framer-motion";
import { Check, CircleX, Info, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";

interface AnimatedMessageProps {
  message: { type: MessageType; message: string } | null;
  onMessageClear?: () => void;
  duration?: number;
}

const styles = {
  success: {
    bg: "bg-green-50 border-green-400 text-green-800",
    icon: Check,
  },
  info: {
    bg: "bg-blue-50 border-blue-400 text-blue-800",
    icon: Info,
  },
  warning: {
    bg: "bg-yellow-50 border-yellow-400 text-yellow-800",
    icon: TriangleAlert,
  },
  error: {
    bg: "bg-red-50 border-red-400 text-red-800",
    icon: CircleX,
  },
};

export default function AnimatedMessage({
  message,
  onMessageClear,
  duration = 3000,
}: AnimatedMessageProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!message) return;

    setShow(true);

    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(() => onMessageClear?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onMessageClear]);

  if (!message) return null;

  const style = styles[message.type];
  const Icon = style.icon;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`
            fixed top-4 right-4 z-50
            flex items-start gap-3
            max-w-sm w-full
            border rounded-xl px-4 py-3 shadow-md
            ${style.bg}
          `}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25 }}
        >
          <Icon className="w-5 h-5 mt-0.5 shrink-0" />
          <p className="flex-1 text-sm leading-snug">
            {message.message}
          </p>

          <button
            onClick={() => {
              setShow(false);
              setTimeout(() => onMessageClear?.(), 300);
            }}
            className="text-lg leading-none opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}