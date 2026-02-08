import { message } from "@/types/TypeInterface";
import AuthStoreManager from "@/util/AuthStoreManager";
import { invoke } from "@tauri-apps/api/core";



export async function create_content(
    discipline_id: number,
    title: string,
    description: string | null,
    orderm_display: number,
) {
    const authData = await AuthStoreManager.get();
    //return await invoke<>("", {});
}