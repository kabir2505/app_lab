import { Request, Response, NextFunction} from "express";
import ErrorHandler from "../errors/ErrorHandler";
import httpStatusCodes from "../errors/HttpCodes";
import { UserRole } from "../utils/Enums";
export function requireAttendee(req:Request, res: Response, next: NextFunction){
    
    try{
    const user = (req as any).user;
    console.log(user);
    
    console.log(user.role);
    if (!user || user.role !== UserRole.ATTENDEE) {
        throw new ErrorHandler(httpStatusCodes.FORBIDDEN, "Attendee access required")

    }

    next();
} catch (error) {
        next(error);
    }
}