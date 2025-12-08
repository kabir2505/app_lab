import { Router, Request, Response, NextFunction } from "express";
import { UserController } from "../../controllers/v1/UserController";
import { UserRole } from "../../utils/Enums";
import { AdminController } from "../../controllers/v1/AdminControllet";
import { UserAuth } from "../../middlewares/UserAuth";
import { requireApprovedOrganizer } from "../../middlewares/ApprovedOrganizerRequired";
import { ReportEventController } from "../../controllers/v1/ReportEventController";
import { requireAttendee } from "../../middlewares/AttendeeRequired";
import { requireAdmin } from "../../middlewares/AdminRequire";

class ReportEventRouter{
    private _router = Router();
    private _reportEventController = ReportEventController; 
    private _auth = UserAuth.verifyJWT;
    private _roleorg = requireApprovedOrganizer;
    private _roleAtt = requireAttendee;
    private _roleAdmin = requireAdmin;

    get router(){
        return this._router;
    }

    constructor(){
        this._configure()
    }

    private _configure(){
        this._router.get("/", this._auth, this._roleAdmin, this._reportEventController.getReportedEvents );
        this._router.post("/:eventId", this._auth, this._roleAtt, this._reportEventController.reportEvent);
        this._router.patch(
  "/:id/status",
  this._auth,
  this._roleAdmin,
  this._reportEventController.updateReportStatus
);

        this._router.patch("/:id/resolve", this._auth, this._roleAdmin, this._reportEventController.resolveReportedEvent);
        this._router.patch("/:id/reject", this._auth, this._roleAdmin, this._reportEventController.rejectReportedEvent);
    }
}

export default new ReportEventRouter().router;