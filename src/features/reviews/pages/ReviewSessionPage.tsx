import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useReviewData } from "@/hooks/useReview";
import { ReviewSessionSetup, SessionType } from "./ReviewSessionSetup";
import { ReviewSession } from "../components/ReviewSession";
import { create_session } from "@/tauri/session";
import { useToast } from "@/context/ToastContext";

// Tipos para controle de estado
type ViewStatus = "setup" | "active" | "finished";

export function ReviewSessionPage() {
  const { id } = useParams();
  const [status, setStatus] = useState<ViewStatus>("setup");
  const [sessiontype, setSessiontype] = useState<SessionType>("CARD");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const { showToast } = useToast();

  const { content, discipline, studyItems, fetchReviewData } = useReviewData();

  useEffect(() => {
    if (id) {
      fetchReviewData(Number(id));
    }
  }, [id, fetchReviewData]);

  const handleStartSession = async (selectedConfig: { type: SessionType}) => {
    try {
      const response = await create_session(
        discipline!.id,
        content!.id,
        selectedConfig.type
      );

      if (response.session_id != 0){
        setSessionId(response.session_id);
        setSessiontype(selectedConfig.type);
        setStatus("active");
      }
    }catch (error) {
      showToast({type: "error", message: "Falha ao criar sessão no Rust: " + error});
    }


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
          onExit={() => setStatus("setup")}
        />
      );
    }

    return (
      <div>
        Nada foi encontrado.
      </div>
    )
  }
}