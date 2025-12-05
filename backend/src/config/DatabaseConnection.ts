import { EventManagerDataSource } from "./DataSource";
import { ensureAdminUserExists } from "../seeds/createAdmin";

export class DatabaseConnection {
    public static instance: DatabaseConnection;

    async init() {
        await this.postgresConnection();
    }


    async postgresConnection() {
        try {
            await EventManagerDataSource.initialize();
            await ensureAdminUserExists();
            const result = await EventManagerDataSource.query("SELECT current_database(), inet_server_addr(), inet_server_port()");
            console.log("Connected to:", result);
            console.log("Entities loaded:", EventManagerDataSource.entityMetadatas);


            console.log("Database connected");
        } catch (error) {
            console.log("Postgres Error-", error);
        }
    }


    public static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }
}