import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useReviewData } from "@/hooks/useReview";
import { ReviewSessionSetup, SessionType } from "./ReviewSessionSetup";
import { ReviewSession } from "../components/ReviewSession";
import { cancel_session, create_session } from "@/tauri/session";
import { useToast } from "@/context/ToastContext";

// Tipos para controle de estado
type ViewStatus = "setup" | "active" | "finished";

export function ReviewSessionPage() {
  const { id } = useParams();
  const [status, setStatus] = useState<ViewStatus>("setup");
  const [sessiontype, setSessiontype] = useState<SessionType>("CARD");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const { showToast } = useToast();
  const sessionRef = useRef({ id: sessionId, active: status === "active" });
  const routeBase = `/reviews`;

  const { content, discipline, studyItems, fetchReviewData } = useReviewData();

  useEffect(() => {
    sessionRef.current = { id: sessionId, active: status === "active" };
  }, [sessionId, status]);

  useEffect(() => {
    if (id) {
      fetchReviewData(Number(id));
    }

    const handleCleanup = () => {
      const { id: sID, active } = sessionRef.current;

      if (active && sID) {
        cancelSession(sID);
      }
    };

    if (!window.location.pathname.startsWith(routeBase)) {
      handleCleanup();
    }

    window.removeEventListener("beforeunload", handleCleanup);

    return () => {
      window.removeEventListener("beforeunload", handleCleanup);

      const isLeavingReview = !window.location.pathname.startsWith("/reviews");

      if (isLeavingReview) {
        handleCleanup();
      }
    }
  }, [id, fetchReviewData]);

  const handleStartSession = async (selectedConfig: { type: SessionType }) => {
    try {
      const response = await create_session(
        discipline!.id,
        content!.id,
        selectedConfig.type
      );

      if (response.session_id != 0) {
        setSessionId(response.session_id);
        setSessiontype(selectedConfig.type);
        setStatus("active");
      }
    } catch (error) {
      showToast({ type: "error", message: "Falha ao criar sessão no Rust: " + error });
    }


  };

  const cancelSession = async (id: number): Promise<void> => {
    if (!id) return;

    try {
      const response = await cancel_session(id);
      if (!response.code) {
        setSessionId(null);
        showToast({ type: "error", message: "Error ao cancelar sessão no Rust!" + response.message });
        return;
      }
      setSessionId(null);
      showToast({ type: "success", message: "Sessão cancelada com sucesso!" });
    } catch (error: any) {
      showToast({ type: "error", message: "Falha ao cancelar sessão no Rust: " + error });
    }
  }

  const hadleCancel = async (isfinished?: boolean) => {
    if (isfinished) {
      setStatus("finished");
      return;
    }
    setStatus("setup");
    if (!sessionId) return;
    await cancelSession(sessionId);
  };

  {
    if (!content || !discipline || !studyItems) {
      return (
        <div>
          Carregando...
        </div>
      );
    }

    if (status === "setup") {
      return (
        <ReviewSessionSetup
          content={content}
          discipline={discipline}
          items={studyItems}
          onStart={handleStartSession}
        />
      );
    }

    if (status === "active" && sessionId && sessiontype) {
      return (
        <ReviewSession
          content={content}
          discipline={discipline}
          items={studyItems}
          sessionType={sessiontype}
          sessionId={sessionId}
          onExit={hadleCancel}
        />
      );
    }
  }

  if (status === "finished"){
    setStatus("setup");
    setSessionId(null);
  }
}