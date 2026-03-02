import { ModalDisciplina } from "../ModalDiscipline";
import ActionButtons from "./ActionButtons";
import { useState } from "react";
import { eventBus } from "@/util/Event";

interface ModalRederProps{
    id: number;
    favorite: boolean
}

export default function ModalRender({id, favorite}: ModalRederProps) {
    const [editId, setEditId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    return (
        <>
            <ActionButtons
                disciplineId={id}
                isFavorite={favorite}
                onAction={(action, id) => {
                    if (action === "edit") setEditId(id);
                    if (action === "delete") setDeleteId(id);
                }}
            >
                <ModalDisciplina
                    id={editId ?? undefined}
                    title="Editar Disciplina"
                    isOpen={editId === id}
                    onClose={() => setEditId(null)}
                    reloadTable={() => eventBus.emit("discipline:updated")}
                />

                <ModalDisciplina
                    id={deleteId ?? undefined}
                    title="Excluir Disciplina"
                    isOpen={deleteId === id}
                    onClose={() => setDeleteId(null)}
                    reloadTable={() => eventBus.emit("discipline:updated")}
                />
            </ActionButtons>
        </>
    );
}