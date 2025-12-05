import { Request, Response, NextFunction} from "express";
import ErrorHandler from "../errors/ErrorHandler";
import httpStatusCodes from "../errors/HttpCodes";
import { UserRole } from "../utils/Enums";

export function requireAdmin(req:Request, res: Response, next: NextFunction){
    
    try{
    const user = (req as any).user;
    
    if (!user || user.role !== UserRole.ADMIN) {
        throw new ErrorHandler(httpStatusCodes.FORBIDDEN, "Admin access required")

    }

    console.log(
        "admin found"
    )

    next();
} catch (error) {
        next(error);
    }
}