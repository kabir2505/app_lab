import { Response } from "express";

export default class ResponseGenerator {
    //constructor
    constructor(private statusCode: number, private data: Object) {
        this.statusCode = statusCode;
        this.data = data;
    }

    //send method => to send response back to client with status code and data
    send(res: Response) {
        return res.status(this.statusCode).json(this.data);
    }
}