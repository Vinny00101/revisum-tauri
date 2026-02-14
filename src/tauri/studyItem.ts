import { StudyItemFullResponse } from "@/types/models";
import { CreateStudyItemInput, message } from "@/types/TypeInterface";
import AuthStoreManager from "@/util/AuthStoreManager";
import { invoke } from "@tauri-apps/api/core";

export interface StudyItemAll{
    message: message;
    study_items: StudyItemFullResponse[] | null;
}

export async function create_study_item(
    input: CreateStudyItemInput
){
    const authData = await AuthStoreManager.get();
    return await invoke<message>("create_study_item_command", {user_id: authData?.user.id ,input: input});
}

export async function get_all_study_item(
    content_id: number,
): Promise<StudyItemAll>{
    const authData = await AuthStoreManager.get();
    return await invoke<StudyItemAll>("get_all_study_item_command", {user_id: authData?.user.id ,content_id: content_id});
}