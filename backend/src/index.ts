import express from "express";
import { config } from "dotenv";
import cors from "cors";
import healthRoute from "./routers/health"

//dotenv configuration
config({ path: `./environments/.env.${process.env.NODE_ENV}` });

//database's
import { DatabaseConnection } from "./config/DatabaseConnection";

//errors
import { ErrorResponse } from "./errors/ErrorResponse";

//routers
import V1Router from "./routers/V1Router";

//ResponseGenerator
import ResponseGenerator from "./utils/ResponseGenerator"

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
        server.app.use(express.urlencoded({ extended: true }));
        server.app.use(cors());

        server.app.post("/test", (req, res) => {
            console.log(req.body);
            new ResponseGenerator(200,req.body).send(res);
        });

        server.app.get("/health", (req, res) => {
            new ResponseGenerator(200, {ok :true}).send(res);
        });

        server.app.use("/api/v1", server.router_v1);

        server.app.use(ErrorResponse.defaultMethod);
        
        const port = process.env.PORT || 8080;
        console.log("Listening on port:", port);
        server.app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (err) {
        console.error("Server failed to start:", err);
    }
})();