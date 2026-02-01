import Database from "@tauri-apps/plugin-sql";

class ConnectionDatabase {
    private database: Database | null = null;

    async init() {
        if (!this.database) {
            this.database = await Database.load("sqlite:revisum.db");
            console.log("Banco conectado com sucesso");
        }
        return this.database;
    }

    get(){
        if (!this.database) {
            throw new Error('Banco não inicializado');
        }
        return this.database;
    }
}

export const connectiondatabase = new ConnectionDatabase();