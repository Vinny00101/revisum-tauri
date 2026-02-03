
import Discipline from "@/lib/models/Discipline";
import DisciplineRepository from "@/lib/repository/discipline/DisciplineRepository";
import UserRepository from "@/lib/repository/user/UserRepository";
import { message } from "@/types/TypeInterface";
import AuthStoreManager from "@/util/AuthStoreManager";

export default class DisciplineService {
    constructor(
        private disciplineRepository: DisciplineRepository,
        private userRepository: UserRepository,
    ) { }

    private async existyUser(): Promise<{ isbool: boolean, id: number | undefined }> {
        const result = await AuthStoreManager.get();
        if ( result && result.user) {
            return {
                isbool: await this.userRepository.existsById(result.user.id),
                id: result.user.id
            };
        }
        return {
            isbool: false,
            id: result?.user.id
        };
    }

    async createDisciplineService(
        name: string,
        description?: string
    ): Promise<message> {
        if (!name) {
            return {
                code: false,
                message: "Campos não preenchidos."
            }
        }
        const existsUser = await this.existyUser();
        if (!existsUser.isbool || !existsUser.id) {
            return {
                code: false,
                message: "Usuário não encontrado."
            }
        }

        if (await this.disciplineRepository.existsNameDiscipline(existsUser.id, name)){
            return {
                code: false,
                message: "Esta disciplina está cadastrada."
            }
        }

        const result = await this.disciplineRepository.createDiscipline(existsUser.id, name, description);
        if(!result){
            return {
                code: false,
                message: "Error ao gerar o id."
            }
        }
        return {
            code: true,
            message: "Disciplina criada com sucesso."
        };
    }

    async getAllDiscipline(): Promise<{ listDisc: Discipline[]; message: message }> {
        const existsUser = await this.existyUser();
        if (!existsUser.isbool || !existsUser.id) {
            return {
                listDisc: [],
                message: {
                    code: true,
                    message: "Usuário não encontrado"
                }
            }
        }

        const disciplines = await this.disciplineRepository.getAllDiscipline(existsUser.id);
        return {
            listDisc: disciplines,
            message: {
                code: true,
                message: "Disciplinas obtidas com sucesso"
            }
        };
    }

    async getDiscipline(id: number): Promise<{ listDisc: Discipline | null; message: message }> {
        const existsUser = await this.existyUser();
        if (!existsUser.isbool || !existsUser.id) {
            return {
                listDisc: null,
                message: {
                    code: true,
                    message: "Usuário não encontrado"
                }
            }
        }

        if (!await this.disciplineRepository.existsById(existsUser.id, id)) {
            return {
                listDisc: null,
                message: {
                    code: false,
                    message: "Disciplina não encontrado"
                }
            }
        }

        const discipline = await this.disciplineRepository.getDiscipline(existsUser.id, id);
        return {
            listDisc: discipline,
            message: {
                code: true,
                message: "Disciplina obtida com sucesso"
            }
        };
    }
}