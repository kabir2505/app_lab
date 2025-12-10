import { Request, Response, NextFunction } from "express";
import { User } from "../../entities/User.entity";
import { bookingRepository, userRepository } from "../../utils/Repositories";
import { organizerRepository } from "../../utils/Repositories";
import ResponseGenerator from "../../utils/ResponseGenerator";
import httpStatusCodes from "../../errors/HttpCodes";
import ErrorHandler from "../../errors/ErrorHandler";
import { ticketRepository } from "../../utils/Repositories";
import { eventRepository } from "../../utils/Repositories";
import * as z from "zod"
import logger from "../../utils/logger";
import { MoreThan } from "typeorm";
import { BookingStatusEnum, TicketTypeEnum } from "../../utils/Enums";
import { TicketType } from "../../entities/TicketType.entity";

const CreateTicketSchema = z.object ({
    name: z.nativeEnum(TicketTypeEnum),
    price: z.number().min(0),
    seatLimit: z.number().min(1)
})

const UpdateTicketSchema = CreateTicketSchema.partial();


export class TicketController{

    //get ticket 

    public static async listAllTicketsForEvent(req:Request,res:Response,next:NextFunction){
        try {
            const eventId = Number(req.params.eventId);

            if (Number.isNaN(eventId)){
                throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "Invalid event id")
            }

            const event = await eventRepository.findOne({
                where: {id:eventId}
            });

            if (!event){
                throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Event not found")
            }

            const tickets = await ticketRepository.find({
                where: {event: {id: eventId}}
            });

            const ticketsWithRemaining = [];
            for (const ticket of tickets){
                const ticketBookedResult = await bookingRepository.createQueryBuilder("booking")
                                            .select("SUM(booking.quantity)","totalBooked")
                                            .where("booking.ticket_type_id = :ticketId", {ticketId: ticket.id})
                                            .andWhere("booking.status = :status", {status: BookingStatusEnum.CONFIRMED})
                                            .getRawOne();
            
                const bookedSeats = Number(ticketBookedResult?.totalBooked) || 0;
                const remainingSeats = ticket.seatLimit - bookedSeats;

                ticketsWithRemaining.push({
                    ...ticket,
                    remainingSeats,
                });
            }

            new ResponseGenerator(httpStatusCodes.OK, {
                success: true,
                message: "List of tickets for event",
                tickets: ticketsWithRemaining
            }).send(res);

        }catch(err){
            next(err);
        }
    }

    public static async getTicketById(req:Request, res:Response, next:NextFunction){
        try {
            const ticketId = Number(req.params.ticketId);

            if (Number.isNaN(ticketId)){
                throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "invalid ticket id")
            }

            const ticket = await ticketRepository.findOne({
                where: {id: ticketId},
                relations: ["event"]
            });

            if (!ticket){
                throw new ErrorHandler(
                    httpStatusCodes.NOT_FOUND,
                    "Ticket type not found"
                )
            }
        const ticketBookedResult = await bookingRepository
        .createQueryBuilder("booking")
        .select("SUM(booking.quantity)", "totalBooked")
        .where("booking.ticket_type_id = :ticketId", { ticketId })
        .andWhere("booking.status = :status", {
            status: BookingStatusEnum.CONFIRMED,
        })
        .getRawOne();

        const bookedSeats = Number(ticketBookedResult?.totalBooked) || 0;
        const remainingSeats = ticket.seatLimit - bookedSeats;

        const responseTicket = {
        ...ticket,
        remainingSeats,
        };

        new ResponseGenerator(httpStatusCodes.OK, {
        success: true,
        message: "Ticket fetched successfully",
        ticket: responseTicket,}).send(res);


        }catch(err){
            next(err);
        }
    }



    public static async createTicketType(req:Request, res: Response, next:NextFunction){
  
        try {
            const organizerId = (req as any).user.id;
            const eventId = Number(req.params.eventId);
            
            const result = CreateTicketSchema.safeParse(req.body);

            if (!result.success){
                throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "All fields required");
            }
            
            const validated = result.data;

            //ensure event exists
            const event = await eventRepository.findOne({
                where: {id: eventId},
                relations: ["organizer"]
            });

            if (!event){
                throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Event not found");
            }

            //check organizer owns this event
            if (event.organizer.id !== organizerId){
                throw new ErrorHandler(
                    httpStatusCodes.FORBIDDEN,
                    "You can only modify your own events"
                );
            } 

            if (validated.seatLimit > event.capacity){
                throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "Tickket seat limit cannot exceed event capacity");
            } 


            //             SELECT *
            // FROM ticket_types t
            // WHERE t.event_id = $1;

            const existingTickets = await ticketRepository.find({
                where:{event: {id: eventId}}
            });

            const totalExistingSeats = existingTickets.reduce(
                (accumulator, currentTicket) => accumulator + currentTicket.seatLimit, 0 
            );

            if (totalExistingSeats + validated.seatLimit > event.capacity){
                throw new ErrorHandler(
                    httpStatusCodes.BAD_REQUEST,
                    `Total ticket seat limits exceeds event capacity, seatLimit left: ${event.capacity - totalExistingSeats}`
                )
            }

            
            const ticket =  ticketRepository.create({
                ...validated,
                event: {id: eventId} as any,//pass event object, eventually only it's id gets saved as event_id
            });

            const savedTicket  = await ticketRepository.save(ticket);

            new ResponseGenerator(httpStatusCodes.CREATED, {
                success: true,
                message: "Ticket created successfully",
                ticket: savedTicket
            }).send(res)



        } catch(err){
        next(err);
    }
    }


    public static async updateTicketType(req: Request, res: Response, next: NextFunction) {
    try {
        const organizerId = (req as any).user.id;
        const ticketId = Number(req.params.ticketId);


        const result = UpdateTicketSchema.safeParse(req.body);
        if (!result.success) {
            throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "Invalid ticket update fields");
        }
        const validated = result.data;


        const ticket = await ticketRepository.findOne({
            where: { id: ticketId },
            relations: ["event", "event.organizer"],
        });

        if (!ticket) {
            throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Ticket type not found");
        }

    
        if (ticket.event.organizer.id !== organizerId) {
            throw new ErrorHandler(
                httpStatusCodes.FORBIDDEN,
                "You can only modify tickets for your own events"
            );
        }



        if (validated.seatLimit && validated.seatLimit > ticket.event.capacity){
            throw new ErrorHandler(
                httpStatusCodes.BAD_REQUEST,
                "Ticket seat limit cannot exceed event capacity"
            )
        }


        const allTickets = await ticketRepository.find({
            where:{event: {id: ticket.event.id}}
        })

        const totalOtherSeats = allTickets.filter( t => t.id != ticket.id).reduce((sum,t) => sum+t.seatLimit,0);
        const newTotal = totalOtherSeats + validated.seatLimit;

        if (newTotal > ticket.event.capacity) {
            throw new ErrorHandler(
                httpStatusCodes.BAD_REQUEST,
                "Total ticket seat limits exceeds event capacity"
            )
        }

        // update
        Object.assign(ticket, validated);

        const updatedTicket = await ticketRepository.save(ticket);

        return new ResponseGenerator(httpStatusCodes.OK, {
            success: true,
            message: "Ticket updated successfully",
            ticket: updatedTicket,
        }).send(res);

    } catch (err) {
        next(err);
    }
}

public static async deleteTicketType(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const organizerId = (req as any).user.id;
        const ticketId = Number(req.params.ticketId);

 
        const ticket = await ticketRepository.findOne({
            where: { id: ticketId },
            relations: ["event", "event.organizer"],
        });

        if (!ticket) {
            throw new ErrorHandler(
                httpStatusCodes.NOT_FOUND,
                "Ticket type not found"
            );
        }

    
        if (ticket.event.organizer.id !== organizerId) {
            throw new ErrorHandler(
                httpStatusCodes.FORBIDDEN,
                "You can only delete tickets for your own events"
            );
        }

 
        await ticketRepository.remove(ticket);

        return new ResponseGenerator(httpStatusCodes.OK, {
            success: true,
            message: "Ticket type deleted successfully",
        }).send(res);

    } catch (err) {
        next(err);
    }
}




}