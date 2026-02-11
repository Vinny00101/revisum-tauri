import { CreateStudyItemInput, message } from "@/types/TypeInterface";
import AuthStoreManager from "@/util/AuthStoreManager";
import { invoke } from "@tauri-apps/api/core";

export async function create_study_item(
    input: CreateStudyItemInput
){
    console.log(input);
    const authData = await AuthStoreManager.get();
    return await invoke<message>("create_study_item_command", {user_id: authData?.user.id ,input: input});
}

