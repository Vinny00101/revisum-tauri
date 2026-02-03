import AnimatedMessage from "@/components/animation/message";
import { useToast } from "@/context/ToastContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { toast, clearToast } = useToast();

  return (
    <>
      {children}
      <AnimatedMessage
        message={toast}
        onMessageClear={clearToast}
      />
    </>
  );
}
