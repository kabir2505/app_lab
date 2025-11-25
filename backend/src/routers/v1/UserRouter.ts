import { Router } from "express";

import { UserController } from "../../controllers/v1/UserController";
import { UserAuth } from "../../middlewares/UserAuth";

class UserRouter {
    private _router = Router();
    private _userController = UserController;

    get router() {
        return this._router;
    }

    constructor() {
        this._configure();
    }

    private _configure(){
        this._router.post("/signup", this._userController.signup);
        this._router.post("/login", this._userController.userLoginViaPassword);
        this._router.post("/request-otp", this._userController.requestOTP);
        this._router.post("/resent-ot[", this._userController.resendOTP);
        this._router.post("/verify-otp", this._userController.verifyOTP)
    }

}

export = new UserRouter().router;

