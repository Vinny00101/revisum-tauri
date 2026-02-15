import { invoke } from "@tauri-apps/api/core";
import { User } from "@/types/models";
import { message, UpdateUserRequest } from "@/types/interfaces";
import AuthStoreManager from "@/util/AuthStoreManager";


export interface UserResponse{
    code: boolean;
    message: string;
    user: User | null;
}

export async function authenticateUser(
    username: string,
    password: string
): Promise<UserResponse> {
    return await await invoke<{ code: boolean; message: string; user: User | null }>(
        "authentication_user_command", { username: username, password: password }
    );
}

export async function registerUser(
    username: string,
    password: string, 
    email: string
):Promise<message> {
    return await invoke<{code: boolean; message: string}>(
        "create_user_command",{username: username, password: password, email: email}
    )
}

export async function getCurrentUser() {
    const authdata = await AuthStoreManager.get();
    return await invoke<UserResponse>("get_current_user_command", {user_id: authdata?.user.id});
}

export async function updateUser(
  updateData: UpdateUserRequest
): Promise<message> {
    const authdata = await AuthStoreManager.get();
    return await invoke<message>("update_user_command", {
      user_id: authdata?.user.id,
      update: updateData,
    });
}