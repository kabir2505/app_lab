// src/utils/ErrorResponse.ts
import { NextFunction, Request, Response } from "express";
import ErrorHandler from "./ErrorHandler";
import logger from "../utils/logger";



export class ErrorResponse {
  static defaultMethod(
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
  ) {

    console.error("🔥 Error in request:", req.method, req.url);
    console.error(err);
    // Case 1: your custom application errors
    if (err instanceof ErrorHandler) {
      logger.error(
        `[${req.method}] ${req.originalUrl} :: ${err.statusCode} :: ${err.message}`
      );

      return res
        .status(err.statusCode)
        .json({ success: false, message: err.message });
    }

    // Case 2: unexpected (runtime) errors
    logger.error(
    { err }, // object first
    `[${req.method}] ${req.originalUrl} :: 500 :: Unexpected error`
    );


    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}