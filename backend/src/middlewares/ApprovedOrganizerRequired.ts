import { Request, Response, NextFunction} from "express";
import ErrorHandler from "../errors/ErrorHandler";
import httpStatusCodes from "../errors/HttpCodes";
import { UserRole } from "../utils/Enums";
export function requireApprovedOrganizer(req:Request, res: Response, next: NextFunction){
    
    try{
    const user = (req as any).user;
    
    if (!user || user.role !== UserRole.ORGANIZER
    ) {
        throw new ErrorHandler(httpStatusCodes.FORBIDDEN, "Organizer access required")

    }


    if (!user.organizerProfile.isApproved){
        throw new ErrorHandler(httpStatusCodes.FORBIDDEN, "You are not approved!")
    }

    next();
} catch (error) {
        next(error);
    }
}