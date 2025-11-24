import { stat } from "fs";

export default class ErrorHandler extends Error {
    constructor(public statusCode: number, public description: string) {
        super(description);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}