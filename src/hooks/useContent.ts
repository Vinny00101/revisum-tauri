// hooks/useReviewData.ts
import { useState, useCallback, useEffect } from "react";
import { Content, get_all_content, get_all_content_user, get_review_data} from "@/features/discipline";
import { useToast } from "@/context/ToastContext";

export function useContent() {
  const [content, setContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  // Busca inicial: Todos os conteúdos do usuário
  const fetchAllContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await get_all_content_user();
      if (result.content) {
        setContent(result.content);
      }
    } catch (err) {
      showToast({ type: "error", message: "Erro ao carregar conteúdos: " + err });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Busca filtrada: Conteúdos de uma disciplina específica
  const fetchContentByDiscipline = useCallback(async (disciplineId: number) => {
    setIsLoading(true);
    try {
      // Aqui usamos a lógica que você enviou, adaptada para o hook
      const result = await get_all_content(disciplineId);
      if (result.content) {
        setContent(result.content);
      }
    } catch (err) {
      showToast({ type: "error", message: "Erro ao filtrar conteúdos da disciplina: "+ err });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const fetchOneContent = useCallback(async (contentId: number) => {
    setIsLoading(true);
    try {
      const result = await get_review_data(contentId);
      if (result.content) {
        setContent([result.content]);
      }
    }catch(err: any){
      showToast({ type: "error", message: "Erro ao carregar conteúdo: "+ err });
    }finally{
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAllContent();
  }, [fetchAllContent]);

  return {
    content,
    isLoading,
    fetchOneContent,
    fetchContentByDiscipline,
    refreshAll: fetchAllContent
  };
}