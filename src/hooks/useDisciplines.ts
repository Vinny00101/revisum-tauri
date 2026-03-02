import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/context/ToastContext";
import { eventBus } from "@/util/Event";
import { get_all_discipline } from "@/features/discipline";


export function useDisciplines() {
    const [disciplines, setDisciplines] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    const getAllDiscipline = useCallback(async () => {
        try {
            setIsLoading(true);
            const result = await get_all_discipline();

            if (result.message.code && result.discipline) {
                setDisciplines(result.discipline);
            } else {
                showToast({ type: "error", message: result.message.message });
                setDisciplines([]);
            }
        } catch (err: any) {
            showToast({ type: "error", message: "Erro inesperado ao buscar disciplinas." });
            console.error("Discipline error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        getAllDiscipline();

        eventBus.on("discipline:updated", getAllDiscipline);

        return () => {
            eventBus.off("discipline:updated", getAllDiscipline);
        };
    }, [getAllDiscipline]);

    return { disciplines, isLoading, refresh: getAllDiscipline };
}