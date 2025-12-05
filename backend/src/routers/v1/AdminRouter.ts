import { Router, Request, Response, NextFunction } from "express";
import { UserController } from "../../controllers/v1/UserController";
import { UserRole } from "../../utils/Enums";
import { AdminController } from "../../controllers/v1/AdminControllet";
import { UserAuth } from "../../middlewares/UserAuth";
import { requireAdmin } from "../../middlewares/AdminRequire";



class AdminRouter{
    private _router = Router();
    private _adminController = AdminController; 
    private _auth = UserAuth.verifyJWT;
    private _role = requireAdmin;

    get router(){
        return this._router;
    }

    constructor(){
        this._configure()
    }

    private _configure(){
    this.router.get("/getPendingOrganizers",this._auth, this._role, this._adminController.listPendingOrganizers);
    this.router.patch("/approveOrganizer/:userId", this._auth, this._role, this._adminController.approveOrganizer);
    this.router.patch("/rejectOrganizer/:userId", this._auth, this._role, this._adminController.rejectOrganizer)
    }
}

export default new AdminRouter().router;
//router is a getter, it's called as instance.router and not instance.router()

