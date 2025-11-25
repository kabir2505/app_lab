// src/routes/user.route.ts
import { Router, Request, Response, NextFunction } from "express";
import ErrorHandler from "../../errors/ErrorHandler";
import httpStatusCodes from "../../errors/HttpCodes";

const router = Router();

router.get("/test", (req: Request, res: Response) => {
  res.json({ success: true, message: "Working!" });
});

// Route that throws a custom error
router.get("/fail", (req: Request, res: Response, next: NextFunction) => {
  next(
    new ErrorHandler(httpStatusCodes.BAD_REQUEST, "Example: Bad request happened")
  );
});

// Route that throws unexpected error
router.get("/crash", (req, res, next) => {
  throw new Error("Unexpected crash!");
});

export default router;
