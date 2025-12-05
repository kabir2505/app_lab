import { Router, Request, Response, NextFunction } from "express";
import { UserController } from "../../controllers/v1/UserController";
import { UserRole } from "../../utils/Enums";
import { UserAuth } from "../../middlewares/UserAuth";
import { requireAttendee } from "../../middlewares/AttendeeRequired";
import { UserProfileController } from "../../controllers/v1/UserProfileController";

class UserProfileRouter {
    private _router = Router();
    private _userController = UserProfileController; // static methods
    private _auth = UserAuth.verifyJWT;
    private _roleatt = requireAttendee;
    get router() {
        return this._router;
    }

    constructor() {
        this._configure();
    }

    private _configure() {
        this._router.get("/bookings", this._auth, this._roleatt, this._userController.getUserBookings);
        this._router.get("/me",this._auth,this._userController.getMe);
        this._router.patch("/", this._auth, this._userController.updateAttendeeProfile)
        this._router.get("/bookings/:bookingId", this._auth, this._roleatt, this._userController.getBookingById)
    }
}

export default new UserProfileRouter().router;
