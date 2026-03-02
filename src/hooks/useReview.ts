import { useToast } from "@/context/ToastContext";
import { Content, Discipline, StudyItemFullResponse } from "@/features/discipline";
import { get_review_data } from "@/tauri/content";
import { useCallback, useState } from "react";

export function useReviewData() {
    const [content, setContent] = useState<Content>();
    const [discipline, setDiscipline] = useState<Discipline>();
    const [studyItems, setStudyItems] = useState<StudyItemFullResponse[]>([]);
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const fetchReviewData = useCallback(async (contentId: number) => {
        setIsLoading(true);
        try {
            const result = await get_review_data(contentId);
            if (result.content && result.discipline && result.study_items) {
                setContent(result.content);
                setDiscipline(result.discipline);
                setStudyItems(result.study_items);
                return;
            }
            showToast({ type: "error", message: "Erro ao carregar conteúdo: " + result.message.message });
        } catch (err: any) {
            showToast({ type: "error", message: "Erro ao carregar conteúdo: " + err });
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    return {
        content,
        discipline,
        studyItems,
        isLoading,
        fetchReviewData
    }
}