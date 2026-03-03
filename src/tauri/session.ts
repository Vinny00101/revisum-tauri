import { SessionType } from "@/features/reviews/pages/ReviewSessionSetup";
import { ReviewDifficulty } from "@/features/reviews/types/ReviewDifficulty";
import { message } from "@/types/interfaces";
import AuthStoreManager from "@/util/AuthStoreManager";
import { invoke } from "@tauri-apps/api/core";


export async function create_session(
    discipline_id: number, 
    content_id: number,
    session_type: SessionType
): Promise<{session_id: number, message: message}>{
    const authData = await AuthStoreManager.get();
    return await invoke<{session_id: number, message: message}>("create_session_review_command", {
        user_id: authData?.user.id, 
        discipline_id: discipline_id, 
        content_id: content_id, 
        session_type: session_type
    });
}

export async function update_session(
    session_id: number, 
    total: number,
    end_time: string,
    accuracy: number,
    correct_items: number,
) {
    const authData = await AuthStoreManager.get();
    return await invoke<message>("update_session_review_command", {
        session_id: session_id,
        user_id: authData?.user.id, 
        update: {
            end_time: end_time, 
            total_items: total, 
            correct_items: correct_items, 
            accuracy: accuracy,
        }
    });
}

export async function save_item_review(
    session_id: number,
    study_item_id: number,
    item_type: string,
    evaluation: ReviewDifficulty,
    time_spent: number = 0,
): Promise<message> {
    const authData = await AuthStoreManager.get();
    return await invoke<message>("save_item_review_command", {input: {
        session_id: session_id, 
        user_id: authData?.user.id, 
        study_item_id: study_item_id, 
        item_type: item_type, 
        evaluation: evaluation, 
        time_spent: time_spent
    }});
}


export async function cancel_session(
    session_id: number,
) {
    const authData = await AuthStoreManager.get();
    return await invoke<message>("cancel_session_review_command", {
        session_id: session_id,
        user_id: authData?.user.id, 
    });
}