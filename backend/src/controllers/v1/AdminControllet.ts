import { Request, Response, NextFunction } from "express";
import { User } from "../../entities/User.entity";
import { userRepository } from "../../utils/Repositories";
import { organizerRepository } from "../../utils/Repositories";
import ResponseGenerator from "../../utils/ResponseGenerator";
import httpStatusCodes from "../../errors/HttpCodes";
import ErrorHandler from "../../errors/ErrorHandler";


export class AdminController{
    public static async listPendingOrganizers(req:Request, res:Response, next:NextFunction){
        try {
            const list= await  organizerRepository.find({
                where: {isApproved:false},
                relations: ["user"]
            }) //can do organizer.user -> user object

            new ResponseGenerator(httpStatusCodes.OK, {
                success:true,
                message: "pending organizers' list",
                organizers:list
            } ).send(res)
        } catch (err){
            next(err);
        }
    }



    public static async approveOrganizer(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.params.userId);
            const profile = await organizerRepository.findOne({
                where: {user: {id: userId}},
                relations: ["user"]
            }) 

            if (!profile){
                throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "profile not found!")
            }

            //set approved to true
            profile.isApproved = true;
            
            await organizerRepository.save(profile)

            new ResponseGenerator(httpStatusCodes.OK, {
                success:true,
                message: "organizer approved!"
            }).send(res)

        } catch(err){
            next(err);
        }
    } 


    public static async rejectOrganizer(req: Request, res:Response, next: NextFunction){
        try{
            const userId = Number(req.params.userId);
            const profile = await organizerRepository.findOne({
                where: {user: {id: userId}},
                relations: ["user"]
            })

            if (!profile){
                throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "profile not found!")
            }

            //set it to approved false
            profile.isApproved = false;

            await organizerRepository.save(profile)

            new ResponseGenerator(httpStatusCodes.OK, {
                success:true,
                message: "organizer not approved!"
            }).send(res)
        } catch(err){
            next(err)
        }
    }

}