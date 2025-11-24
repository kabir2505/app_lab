import path from "path";
import { DataSource } from "typeorm";


export const EventManagerDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: parseInt(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    entities: [path.resolve(__dirname, "../entity/*.entity.{ts,js}")],
    synchronize: true,
    logging: false,
});