import UserRepository from "@/lib/repository/user/UserRepository";
import{ User, message } from "@/types/TypeInterface";

interface Auth{
    message: message;
    user: User | null;
}

export default class UserService {
    constructor(
        private userRepository: UserRepository,
    ) { }

    private async hashPassword(password: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);

        const bytes = new Uint8Array(hashBuffer);

        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }

        return btoa(binary);
    }

    async authenticationUser(username: string, password: string): Promise<Auth> {
        if (!username || !password) {
            return {
                message: {
                    code: false,
                    message: "Campos não preenchidos"
                },
                user: null
            }
        }

        const hashPassword = await this.hashPassword(password);

        const user = await this.userRepository.verifyUser(username);
        if (!user || user.passwordHash !== hashPassword) {
            return {
                message: {
                    code: false,
                    message: "username ou password incorreto"
                },
                user: null
            }
        }

        const userdto: User = {
            id: user.id,
            name: user.username,
            email: user.email,
            avatarPath: user.avatarPath,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        }
        console.log(userdto);
        return {
            message: {
                code: true,
                message: "Logado com sucesso"
            },
            user: userdto
        }
    }

    async createUserService(username: string, password: string, email: string): Promise<message> {
        if (!username || !password || !email) {
            return {
                code: false,
                message: "Campos não preenchidos"
            }
        }

        const hashPassword = await this.hashPassword(password);

        if (await this.userRepository.verifyUser(username)) {
            return {
                code: false,
                message: "Esse username jã existe"
            }
        }

        if (await this.userRepository.verifyEmail(email)) {
            return {
                code: false,
                message: "Email já existe"
            }
        }

        await this.userRepository.createUser(username, email, hashPassword, null);
        return {
            code: true,
            message: "Registro efetuado com sucesso"
        };
    }
}