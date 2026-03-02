import { Discipline } from "../features/discipline/types/interfaces";
import { message } from "@/types/interfaces";
import AuthStoreManager from "@/util/AuthStoreManager";
import { invoke } from "@tauri-apps/api/core";

export interface DisciplineAll {
    message: message;
    discipline: Discipline[] | null;
}

export interface DisciplineOne {
    message: message;
    discipline: Discipline | null;
}

export async function create_discipline(
    name: string,
    description: string,
): Promise<{code: number; message: string}> {
    const authData = await AuthStoreManager.get();
    return await invoke<{code: number; message: string}>("create_discipline_command", {
        user_id: authData?.user.id,
        name: name,
        description: description,
    });
}

export async function delete_discipline(discipline_id: number): Promise<message>{
    const authData = await AuthStoreManager.get();
    return await invoke<message>("delete_discipline_command", {
        user_id: authData?.user.id,
        discipline_id: discipline_id
    });
}

export async function get_discipline(discipline_id: number): Promise<DisciplineOne> {
    const authData = await AuthStoreManager.get();
    return await invoke<DisciplineOne>("get_discipline_command", {
        user_id: authData?.user.id,
        discipline_id: discipline_id
    });
}

export async function get_all_discipline(): Promise<DisciplineAll> {
    const authData = await AuthStoreManager.get();
    return await invoke<DisciplineAll>("get_all_discipline_command", {
        user_id: authData?.user.id
    });
}

export async function update_discipline(
    discipline_id: number,
    name: string,
    description: string | null
): Promise<message>{
    const authData = await AuthStoreManager.get();
    return await invoke<message>("update_discipline_command", {
        user_id: authData?.user.id,
        discipline_id: discipline_id,
        name: name,
        description: description
    });
}