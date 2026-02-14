import { Content } from "@/types/models";
import { message } from "@/types/TypeInterface";
import AuthStoreManager from "@/util/AuthStoreManager";
import { invoke } from "@tauri-apps/api/core";

export interface ContentOne{
    message: message;
    content: Content | null;
}
export interface ContentAll{
    message: message;
    content: Content[] | null;
}



export async function create_content(
    discipline_id: number,
    title: string,
    description: string | null,
    display_order: number,
): Promise<message> {
    const authData = await AuthStoreManager.get();
    return await invoke<message>("create_content_command", {
        user_id: authData?.user.id, 
        discipline_id: discipline_id, 
        title: title, description: 
        description, 
        display_order: display_order
    });
}

export async function update_content(
    content_id: number,
    discipline_id: number,
    title: string,
    description: string | null,
    display_order: number,
): Promise<message> {
    const authData = await AuthStoreManager.get();
    return await invoke<message>("update_content_command", {
        user_id: authData?.user.id, 
        discipline_id: discipline_id, 
        content_id: content_id, 
        title: title, 
        description: description, 
        display_order: display_order
    });
}

export async function get_all_content(
    discipline_id: number,
): Promise<ContentAll> {
    const authData = await AuthStoreManager.get();
    return await invoke<ContentAll>("get_all_content_command", {
        user_id: authData?.user.id, 
        discipline_id: discipline_id, 
    });
}

export async function get_content(
    content_id: number,
    discipline_id: number,
): Promise<ContentOne> {
    const authData = await AuthStoreManager.get();
    return await invoke<ContentOne>("get_content_command", {
        user_id: authData?.user.id, 
        content_id: content_id,
        discipline_id: discipline_id, 
    });
}

export async function delete_content(
    content_id: number,
    discipline_id: number,
): Promise<message> {
    const authData = await AuthStoreManager.get();
    return await invoke<message>("delete_content_command", {
        user_id: authData?.user.id, 
        content_id: content_id,
        discipline_id: discipline_id, 
    });
}