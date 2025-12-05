import { Router, Request, Response, NextFunction } from "express";
import { UserController } from "../../controllers/v1/UserController";
import { UserRole } from "../../utils/Enums";
import { AdminController } from "../../controllers/v1/AdminControllet";
import { UserAuth } from "../../middlewares/UserAuth";
import { requireApprovedOrganizer } from "../../middlewares/ApprovedOrganizerRequired";
import { EventController } from "../../controllers/v1/EventController";
import { requireAttendee } from "../../middlewares/AttendeeRequired";


class EventRouter{
    private _router = Router();
    private _eventController = EventController; 
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
    this.router.get("/", this._eventController.listAllEvents); //no auth or role needed
    this.router.get("/search", this._eventController.searchEvents);
    this.router.get("/company-events", this._auth, this._eventController.listOrgEvents)
    this.router.get("/upcoming",this._eventController.listUpcomingEvents);
    this.router.get("/:eventId", this._eventController.listEventById); // no auth or role needed
    this.router.get("/:eventId/attendees", this._auth, this._roleorg,this._eventController.getEventAttendees)
    this.router.post("/", this._auth, this._roleorg, this._eventController.createEvent);
    this.router.patch("/:eventId", this._auth, this._roleorg, this._eventController.updateEvent);
    this.router.delete("/:eventId", this._auth, this._roleorg, this._eventController.deleteEvent);
    this.router.post("/:eventId/book",this._auth,this._roleatt, this._eventController.bookEventTicket);

    }
}

export default new EventRouter().router;
//router is a getter, it's called as instance.router and not instance.router()

