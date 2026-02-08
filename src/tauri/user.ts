import { invoke } from "@tauri-apps/api/core";
import { User } from "@/types/models";
import { message } from "@/types/TypeInterface";


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