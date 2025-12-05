import { Router, Request, Response, NextFunction } from "express";
import { UserController } from "../../controllers/v1/UserController";
import { UserRole } from "../../utils/Enums";
import { AdminController } from "../../controllers/v1/AdminControllet";
import { UserAuth } from "../../middlewares/UserAuth";
import { requireApprovedOrganizer } from "../../middlewares/ApprovedOrganizerRequired";
import { EventController } from "../../controllers/v1/EventController";
import { requireAttendee } from "../../middlewares/AttendeeRequired";
import { ReviewController } from "../../controllers/v1/ReviewController";

class ReviewRouter{
    private _router = Router();
    private _reviewRouter = ReviewController; 
    private _auth = UserAuth.verifyJWT;
    private _roleorg = requireApprovedOrganizer;
    private _roleatt = requireAttendee;

    get router(){
        return this._router;
    }

    constructor(){
        this._configure()
    }

    private _configure(){
        this._router.post("/event/:eventId", this._auth, this._roleatt, this._reviewRouter.leaveReview);
        this._router.patch("/:reviewId/events/:eventId", this._auth,this._roleatt, this._reviewRouter.updateReview);
        this._router.delete("/:reviewId/event/:eventId",this._auth, this._roleatt, this._reviewRouter.deleteReview );

    }
}

export default new ReviewRouter().router;