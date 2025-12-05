import { Router, Request, Response, NextFunction } from "express";
import { UserController } from "../../controllers/v1/UserController";
import { UserRole } from "../../utils/Enums";
import { UserAuth } from "../../middlewares/UserAuth";
import { requireAttendee } from "../../middlewares/AttendeeRequired";

class UserRouter {
    private _router = Router();
    private _userController = UserController; // static methods
    private _auth = UserAuth.verifyJWT;
    private _roleatt = requireAttendee;
    get router() {
        return this._router;
    }

    constructor() {
        this._configure();
    }

    private _configure() {
        // /signup/user → role = ATTENDEE
        this._router.post(
            "/signup/user",
            (req: Request, res: Response, next: NextFunction) => {
                (req as any).body.role = UserRole.ATTENDEE;   // attach role
                console.log((req as any).role)
                next();
            },
            this._userController.userSignUp
        );

        // /signup/organizer → role = ORGANIZER
        this._router.post(
            "/signup/organizer",
            (req: Request, res: Response, next: NextFunction) => {
                (req as any).body.role = UserRole.ORGANIZER;
                
                next();
            },
            this._userController.userSignUp
        );

        this._router.post("/login", this._userController.userLoginViaPassword);
    }
}

export default new UserRouter().router;
