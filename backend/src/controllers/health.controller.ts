import { Request, Response } from "express";

export const healthCheck = (req: Request, res: Response) => {
    req.log.info('Health check hit')
    res.status(200).json({
        status: "OK",
        uptime: process.uptime(),
        timestamp: new Date()
    })
}