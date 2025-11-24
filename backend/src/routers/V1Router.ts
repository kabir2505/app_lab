import { Router } from "express";
// import {UserRouter} from "./v1/UserRouter"
class V1Router{ 
    private _router = Router();

    // private _userRouter = UserRouter;

    get router() {
        return this._router;
    }

    constructor() {
        this._configure();
    }

    private _configure() {
        // this._router.use("/user", this._userRouter)
        
    }

}

export = new V1Router().router;