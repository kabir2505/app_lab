import { Request, Response, NextFunction} from "express";
import ErrorHandler from "../errors/ErrorHandler";
import httpStatusCodes from "../errors/HttpCodes";
import { UserRole } from "../utils/Enums";
export function requireAdmin(req:Request, res: Response, next: NextFunction){
    
    try{
    const user = (req as any).user;
    
    if (!user || user.role !== UserRole.ORGANIZER
    ) {
        throw new ErrorHandler(httpStatusCodes.FORBIDDEN, "Organizer access required")

    }

    next();
} catch (error) {
        next(error);
    }
}