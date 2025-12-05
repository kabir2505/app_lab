import { Request, Response, NextFunction } from "express";
import jsonwebtoken from "jsonwebtoken";

import ErrorHandler from "../errors/ErrorHandler";
import httpStatusCodes from "../errors/HttpCodes";

import { User } from "../entities/User.entity";

import { userRepository } from "../utils/Repositories";
import { json } from "body-parser";
import logger from "../utils/logger";

export class UserAuth {
    public static async verifyJWT(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const authHeader = req.headers.authorization;

        
            if (!authHeader) {
                throw new ErrorHandler(
                    httpStatusCodes.UN_AUTHORIZED,
                    "Authorization header is missing"
                )
            }
            //["Bearer", "2hj..."]
            const token = authHeader.split(" ")[1] //"ehjjj"

            //verify token
            const decoded = jsonwebtoken.verify(
                token,
                process.env.JWT_SECRET as string
            );

            if (!decoded) {
                throw new ErrorHandler(
                    httpStatusCodes.FORBIDDEN,
                    "Invalid token"
                )
            }


            //get the user

            const user: User = await userRepository.findOne({
                where: {id: decoded.id},
                relations:["organizerProfile"]
            })

            

            if (!user){
                throw new ErrorHandler(
                    httpStatusCodes.FORBIDDEN,
                    "User does not exist"
                );
            }

            //attach the user to the request object
            req["user"] = user;
            next()

        } catch(err){
            logger.error({err}, "error authorizing user" )
            next(err);
        }
    }
}