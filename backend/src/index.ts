import express from "express";
import { config } from "dotenv";
import cors from "cors";
import healthRoute from "./routers/health"
import {z} from "zod";
import pinoHttp from 'pino-http';
import logger from "./utils/logger"
//database's
import { DatabaseConnection } from "./config/DatabaseConnection";

//errors
import { ErrorResponse } from "./errors/ErrorResponse";

//routers
import V1Router from "./routers/V1Router";

//ResponseGenerator
import ResponseGenerator from "./utils/ResponseGenerator"
import pino from "pino";

//dotenv configuration
config({ path: `./environments/.env.${process.env.NODE_ENV}` });

const envSchema = z.object({
    NODE_ENV: z.enum(["staging","production","test"]).default("staging"),
    PORT: z.string().default("8080"),
    POSTGRES_HOSTNAME: z.string(),
    POSTGRES_PORT: z.string(),
    POSTGRES_USERNAME: z.string(),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_DATABASE: z.string(),
    JWT_SECRET: z.string(),
    EMAIL: z.email(),
    EMAIL_PASSWORD: z.string()

});


const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("Invalid environment variabled:", parsed.error.flatten().fieldErrors);
    process.exit(1)
}

class Server {
    private _app = express();
    private _router_v1 = V1Router;



    async init() {
        await this._configure();
    }

    get app() {
        return this._app;
    }

    get router_v1() {
        return this._router_v1;
    }

    private async _configure() {
        //await DatabaseConnection.getInstance().init();

    }
}


const server = new Server();

(async () => {
    try {
        console.log("Starting server...");
        await server.init();
        console.log("Server initialized");

        server.app.use(express.json());
        server.app.use("/health", healthRoute)
        server.app.use(
            pinoHttp({
                logger,
                autoLogging: true,
                // serializers: {
                //     err:pinoHttp.stdSerializers.err,
                //     req: pinoHttp.stdSerializers.req,
                //     res: pinoHttp.stdSerializers.res
                // }
            })
        )
        server.app.use(express.urlencoded({ extended: true }));
        server.app.use(cors());

        server.app.post("/test", (req, res) => {
            console.log(req.body);
            new ResponseGenerator(200,req.body).send(res);
        });

        // server.app.get("/health", (req, res) => {
        //     new ResponseGenerator(200, {ok :true}).send(res);
        // });

        server.app.use("/api/v1", server.router_v1);

        server.app.use(ErrorResponse.defaultMethod);
        
        const port = process.env.PORT || 8080;
        console.log("Listening on port:", port);
        server.app.listen(port, () => {
            logger.info({ port }, 'Server Started')
        });
    } catch (err) {
        console.error("Server failed to start:", err);
    }
})();