import { NextFunction, Request, Response } from "express";
import ErrorHandler from "./ErrorHandler";


export class ErrorResponse {
    static defaultMethod(
    err: ErrorHandler,
    req: Request,
        res: Response,
    next: NextFunction) {
        return res.status(err.statusCode || 500).json({ message: err.message, success: false });
    }
    
}