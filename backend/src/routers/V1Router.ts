import { Router } from "express";
import userRouter from "./v1/UserRouter";
import adminRouter from "./v1/AdminRouter"
import eventRouter from "./v1/EventRouter"
import ticketRouter from "./v1/TicketRouter";
import userProfileController from "./v1/UserProfileRouter"
import reviewRouter from "./v1/ReviewRouter";
import reportEventRouter from "./v1/ReportEventRouter"

class V1Router{ 
    private _router = Router();

    private _userRouter = userRouter;

    private _eventRouter = eventRouter;

    private _ticketRouter = ticketRouter;

    private _userProfileController = userProfileController;
    private _reviewRouter = reviewRouter;

    private _reportEventRouter = reportEventRouter;
    get router() {
        return this._router;
    }

    constructor() {
        this._configure();
    }

    private _configure() {
        this._router.use("/auth", this._userRouter)
        this._router.use("/admin",adminRouter)
        this._router.use("/event", this._eventRouter)
        this._router.use("/ticket", this._ticketRouter)
        this._router.use("/profile",this._userProfileController)
        this._router.use("/review", this._reviewRouter);
        this._router.use("/report", this._reportEventRouter)
    }

}

export = new V1Router().router;