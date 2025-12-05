import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import * as fs from "fs/promises";
import path from "path";
import * as z from "zod"

//ENUMS
import {BookingStatusEnum, UserRole} from "../../utils/Enums";

//MAILER
// import {MailTransporter} from "../../config/MailTransporter";

//REST ERRORS & RESPONSE
import ErrorHandler from "../../errors/ErrorHandler";
import httpStatusCodes from "../../errors/HttpCodes";
import ResponseGenerator from "../../utils/ResponseGenerator";

//ENTITIES
import { User } from "../../entities/User.entity";

//REPOSITORIES
import { attendeeProfileRepository, bookingRepository, userRepository } from "../../utils/Repositories";
import { AuthHelper } from "../../utils/AuthHelper";
import logger from "../../utils/logger";
import { TicketType } from "../../entities/TicketType.entity"; 
 

export const UpdateAttendeeProfileSchema = z.object({
  preferences: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
})

export class UserProfileController {

    public static async getUserBookings(req:Request, res:Response, next:NextFunction){

            try {
                const userId = (req as any).user.id;

                const bookings = await bookingRepository.find({
                    where: {user: {id: userId}},
                    relations: ["ticketType", "ticketType.event"],
                    order: {createdAt: "DESC"}
                });

                if (bookings.length == 0) {
                    return new ResponseGenerator(httpStatusCodes.OK, {
                        success: true,
                        message: "No bookings found",
                        bookings: []
                    }).send(res)
                }

                const finalBookings = [];

                for (const booking of bookings){
                    const ticket = booking.ticketType;

                    //seats filled for this ticket
                    const bookedResult = await bookingRepository
                                        .createQueryBuilder("booking")
                                        .select("SUM(booking.quantity)", "totalBooked")
                                        .where("booking.ticket_type_id = :ticketId", {ticketId: ticket.id})
                                        .andWhere("booking.status = :status", {
                                            status: BookingStatusEnum.CONFIRMED
                                        })
                                        .getRawOne();
                    
                    const bookedCount = Number(bookedResult?.totalBooked) || 0;
                    const remainingSeats = ticket.seatLimit - bookedCount;

                    finalBookings.push({
                        ...booking,
                        ticketType: {
                            ...ticket,
                            remainingSeats,
                            event: ticket.event

                        }
                    })
                }
            new ResponseGenerator(httpStatusCodes.OK, {
                success:true,
                message: "User bookings fetched successfully",
                bookings: finalBookings
            }).send(res);
            } catch(err){
                next(err);
            }

        }


    public static async getMe(req: Request,res: Response,next: NextFunction) {
        try {

        const user = (req as any).user;

        const user_obj = await userRepository.findOne({
            where: { id: user.id },
            relations: ["organizerProfile", "attendeeProfile"],
        });

        if (!user_obj) {
            throw new ErrorHandler(
            httpStatusCodes.NOT_FOUND,
            "User not found"
            );
        }

        // Remove sensitive fields before sending
        const { passwordHash, ...safeUser } = user_obj as any;

        new ResponseGenerator(httpStatusCodes.OK, {
            success: true,
            message: "Current user details",
            user: safeUser,
        }).send(res);
        } catch (err) {
        next(err);
        }
  }

  public static async updateAttendeeProfile(req: Request, res:Response, next: NextFunction){

    try {
        const user = (req as any).user;

        const result = UpdateAttendeeProfileSchema.safeParse(req.body);
        if (!result.success){
            throw new ErrorHandler(
                httpStatusCodes.BAD_REQUEST,
                "Invalid profile fields"
            )
        }

        const updates = result.data;
        const user_profile  = await userRepository.findOne({
            where: {id: user.id},
            relations: ["attendeeProfile"]
        })

        let profile = user_profile.attendeeProfile;

        if (!profile){
            profile = attendeeProfileRepository.create({
                user: {id: user.id} as any,
                preferences: null,
                bio: null,
                avatarUrl: null
            })
        }

        //update
        Object.assign(profile,updates)

        //save
        const savedProfile = await attendeeProfileRepository.save(profile);

        return new ResponseGenerator(httpStatusCodes.OK, {
            success:true,
            message: "Attendee Profile Updated",
            profile: savedProfile
        }).send(res);

    }catch(err){
        next(err)
    }
  }     

  public static async getBookingById(
    req: Request,res: Response,next: NextFunction) {
    try {
        const userId = (req as any).user.id;
        const bookingId = Number(req.params.bookingId);

        if (isNaN(bookingId)) {
            throw new ErrorHandler(
                httpStatusCodes.BAD_REQUEST,
                "Invalid booking ID"
            );
        }

        const booking = await bookingRepository.findOne({
            where: { id: bookingId },
            relations: [
                "user",
                "ticketType",
                "ticketType.event"
            ],
        });

        if (!booking) {
            throw new ErrorHandler(
                httpStatusCodes.NOT_FOUND,
                "Booking not found"
            );
        }

        if (booking.user.id !== userId) {
            throw new ErrorHandler(
                httpStatusCodes.FORBIDDEN,
                "You cannot view another user's booking"
            );
        }

      
        const bookedResult = await bookingRepository
            .createQueryBuilder("booking")
            .select("SUM(booking.quantity)", "totalBooked")
            .where("booking.ticket_type_id = :ticketId", {
                ticketId: booking.ticketType.id,
            })
            .andWhere("booking.status = :status", {
                status: BookingStatusEnum.CONFIRMED,
            })
            .getRawOne();

        const bookedCount = Number(bookedResult?.totalBooked) || 0;
        const remainingSeats =
            booking.ticketType.seatLimit - bookedCount;

        const responseData = {
            id: booking.id,
            quantity: booking.quantity,
            totalPrice: booking.totalPrice,
            status: booking.status,
            bookedAt: booking.createdAt,

            ticketType: {
                id: booking.ticketType.id,
                name: booking.ticketType.name,
                price: booking.ticketType.price,
                seatLimit: booking.ticketType.seatLimit,
                remainingSeats,
            },

            event: {
                id: booking.ticketType.event.id,
                title: booking.ticketType.event.title,
                location: booking.ticketType.event.location,
                category: booking.ticketType.event.category,
                startDateTime: booking.ticketType.event.startDateTime,
            },
        };

        return new ResponseGenerator(httpStatusCodes.OK, {
            success: true,
            message: "Booking details fetched",
            booking: responseData,
        }).send(res);
    } catch (err) {
        next(err);
    }
}


}