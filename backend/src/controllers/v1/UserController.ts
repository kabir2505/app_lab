import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import * as fs from "fs/promises";
import path from "path";
import * as z from "zod"

//ENUMS
import {BookingStatusEnum, UserRole} from "../../utils/Enums";


import ErrorHandler from "../../errors/ErrorHandler";
import httpStatusCodes from "../../errors/HttpCodes";
import ResponseGenerator from "../../utils/ResponseGenerator";

//ENTITIES
import { User } from "../../entities/User.entity";

//REPOSITORIES
import { bookingRepository, userRepository } from "../../utils/Repositories";
import { AuthHelper } from "../../utils/AuthHelper";
import logger from "../../utils/logger";
import { TicketType } from "../../entities/TicketType.entity";




const UserSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
})

const UserLoginSchema = z.object({
    email: z.string().email(),
    password: z.string()
})




export class UserController {
    public static async userSignUp(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> { //async fn always returns a Promise
        try {
            const {name, email, password, role} = req.body;
            
            const result = UserSchema.safeParse({name: name, email: email, password: password, role:role})
            //null, key does not exist, ""(empty string)
            
            if (!result.success){
                throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "All field are required!")
            }

            if (!Object.values(UserRole).includes(role)) {
                //console.log(Object.values(UserRole))
                throw new ErrorHandler(httpStatusCodes.BAD_REQUEST,
                    "Invalid role"
                );
            }

            //check if user with email already exists
            const user: User = await userRepository.findOne(
                {
                    where: {email},
                }
            )

            if (user){
                throw new ErrorHandler(
                    httpStatusCodes.BAD_REQUEST,
                    "User with this email already exists"
                );
            }

            const hashedPassword: string = await bcrypt.hash(password,10);
            let newUser: User;

            if (role == UserRole.ATTENDEE) {
                const {preferences, bio, avatarUrl} = req.body;
                //preferences,avatarUrl, bio all CAN be null

                newUser = await userRepository.save({
                    name:name,
                    email:email,
                    passwordHash: hashedPassword,
                    role,
                    attendeeProfile: {
                        preferences: preferences,
                        bio: bio,
                        avatarUrl: avatarUrl
                    }
                })} else {

                    const { organizationName ,website, bio} = req.body;

                    newUser = await userRepository.save({
                        name:name,
                        email:email,
                        passwordHash: hashedPassword,
                        role,
                        organizerProfile:{
                            organizationName: organizationName,
                            bio:bio,
                            website: website
                        },
                    });
                }

            const token = AuthHelper.generateJWTToken(
                newUser.id,
                newUser.email,
                newUser.role
            );
            

            new ResponseGenerator(httpStatusCodes.CREATED, {
                success: true,
                message: "User created successfully",
                token,
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role
                },
            }).send(res)

            logger.info({userId: user.id, role: user.role}, "User signed up");

        } catch (err) {
            logger.error({err}, "Error in userSignUp")
            next(err);


        }
    }

    public static async userLoginViaPassword(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void>{
        try{
            const {email, password} = req.body;
            const result = UserLoginSchema.safeParse({email: email, password:password})

            if (!result.success){
                throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "All fields are required");
            }

            const user = await userRepository.findOne({where: {email}});
            
            if (!user){
                throw new ErrorHandler(
                    httpStatusCodes.BAD_REQUEST,
                    "User with this email does not exist!"
                );
            }

            const isPasswordValid = await bcrypt.compare(
                password,
                user.passwordHash
            );

            if (!isPasswordValid){
                throw new ErrorHandler(
                    httpStatusCodes.BAD_REQUEST,
                    "Invalid password"
                );
            }

            if ( user.isBlocked){
                throw new ErrorHandler(
                    httpStatusCodes.FORBIDDEN,
                    "Your account has been blocked!"
                )
            }

            const token: string = AuthHelper.generateJWTToken(
                user.id,
                user.email,
                user.role
            );

            new ResponseGenerator(httpStatusCodes.OK, {
                success:true,
                message: "User logged in successfully",
                token,
                user: {
                    id: user.id,
                    name: user.email,
                    role: user.role
                }
            }).send(res);


            
        } catch(err){
            logger.error({err}, "error while logging in");
            next(err);
        }
    }
    




}