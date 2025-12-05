import { Router, Request, Response, NextFunction } from "express";
import { UserController } from "../../controllers/v1/UserController";
import { UserRole } from "../../utils/Enums";
import { AdminController } from "../../controllers/v1/AdminControllet";
import { UserAuth } from "../../middlewares/UserAuth";
import { requireApprovedOrganizer } from "../../middlewares/ApprovedOrganizerRequired";
import { TicketController } from "../../controllers/v1/TicketController";


class TicketRouter{
    private _router = Router();
    private _ticketController = TicketController; 
    private _auth = UserAuth.verifyJWT;
    private _roleorg = requireApprovedOrganizer;

    get router(){
        return this._router;
    }

    constructor(){
        this._configure()
    }

    private _configure(){
        // createTicket = authenticated, verified organizer
        this._router.get("/event/:eventId", this._auth, this._roleorg, this._ticketController.listAllTicketsForEvent);
        this._router.get("/:ticketId", this._auth, this._ticketController.getTicketById);
        this._router.post("/event/:eventId",this._auth,this._roleorg,this._ticketController.createTicketType);
        this._router.patch("/:ticketId", this._auth, this._roleorg, this._ticketController.updateTicketType);
        this._router.delete("/:ticketId",this._auth,this._roleorg,this._ticketController.deleteTicketType)
    }
}

export default new TicketRouter().router;