import { Request, Response, NextFunction } from "express";
import { User } from "../../entities/User.entity";
import { eventRepository, reportedEventRepository, userRepository } from "../../utils/Repositories";
import { organizerRepository } from "../../utils/Repositories";
import ResponseGenerator from "../../utils/ResponseGenerator";
import httpStatusCodes from "../../errors/HttpCodes";
import ErrorHandler from "../../errors/ErrorHandler";
import { UserRole } from "../../utils/Enums";
import { MoreThanOrEqual, LessThan } from "typeorm";

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



    public static async getAdminStats(req: Request, res: Response, next: NextFunction) {
    try {
        // ----------------------------
        // USERS
        // ----------------------------
        const totalUsers = await userRepository.count();

        const totalOrganizers = await userRepository.count({
            where: { role: UserRole.ORGANIZER }
        });

        const totalAttendees = await userRepository.count({
            where: { role: UserRole.ATTENDEE }
        });

        const pendingOrganizers = await organizerRepository.count({
            where: { isApproved: false }
        });


        const totalEvents = await eventRepository.count();

        const now = new Date();

        const upcomingEvents = await eventRepository.count({
            where: {
                startDateTime: MoreThanOrEqual(now),
            }
        });

        const pastEvents = await eventRepository.count({
            where: {
                startDateTime: LessThan(now),
            }
        });


        const reportedEvents = await reportedEventRepository.count();

        new ResponseGenerator(httpStatusCodes.OK, {
            success: true,
            message: "Admin stats overview",
            stats: {
                totalUsers,
                totalOrganizers,
                totalAttendees,
                pendingOrganizers,
                totalEvents,
                upcomingEvents,
                pastEvents,
                reportedEvents
            }
        }).send(res);

    } catch (err) {
        next(err);
    }
}

    public static async listAllOrganizers(req: Request, res: Response, next: NextFunction) {
  try {
    const organizers = await organizerRepository.find({
      relations: ["user"], 
      order: { id: "ASC" }
    });

    const formatted = organizers.map(o => ({
      id: o.id,
      organizationName: o.organizationName ?? null,
      isApproved: o.isApproved,
      createdAt: o.user.createdAt,
      user: {
        id: o.user.id,
        name: o.user.name,
        email: o.user.email,
      }
    }));

    return new ResponseGenerator(httpStatusCodes.OK, {
      success: true,
      organizers: formatted,
    }).send(res);

  } catch (err) {
    next(err);
  }
}



}