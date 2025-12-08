import { Request, Response, NextFunction } from "express";
import { User } from "../../entities/User.entity";
import { userRepository } from "../../utils/Repositories";
import { organizerRepository } from "../../utils/Repositories";
import ResponseGenerator from "../../utils/ResponseGenerator";
import httpStatusCodes from "../../errors/HttpCodes";
import ErrorHandler from "../../errors/ErrorHandler";
import { eventRepository } from "../../utils/Repositories";
import * as z from "zod"
import logger from "../../utils/logger";
import { MoreThan } from "typeorm";

import { bookingRepository } from "../../utils/Repositories";
import { ticketRepository } from "../../utils/Repositories";
import { BookingStatusEnum } from "../../utils/Enums";

const EventSchema = z.object({
    title: z.string(),
    description: z.string(),
    location: z.string(),
    category: z.string(),
    startDateTime: z.coerce.date(),
    capacity: z.number(),
    bannerImageUrl: z.string().nullable(),
    teasorVideoUrl: z.string().nullable()
})



const EventUpdateSchema = EventSchema.partial();

const CreateBookingSchema = z.object({
    ticketTypeId: z.number().int().positive(),
    quantity: z.number().int().positive(),
});

export class EventController{

    public static async listAllEvents(req:Request, res:Response, next:NextFunction){
        // can be accessed by anyone, doesnt have to be logged in
            try {
                //keep relations simple for get all 
                const events = await eventRepository.find({where: {isBlocked:false}, relations: ["organizer", "reviews", "ticket_type"]})
                 for (const event of events) {

                // --- remainingCapacity ---
                const totalBookedResult = await bookingRepository
                .createQueryBuilder("booking")
                .leftJoin("booking.ticketType", "ticketType")
                .select("SUM(booking.quantity)", "totalBooked")
                .where("ticketType.event_id = :eventId", { eventId: event.id })
                .andWhere("booking.status = :status", {
                    status: BookingStatusEnum.CONFIRMED,
                })
                .getRawOne();

                const totalBooked = Number(totalBookedResult.totalBooked) || 0;

                (event as any).remainingCapacity =
                    event.capacity != null ? event.capacity - totalBooked : null;

                // --- remainingSeats for each ticket type ---
                for (const ticket of event.ticket_type) {

                    const ticketBookedResult = await bookingRepository
                        .createQueryBuilder("booking")
                        .select("SUM(booking.quantity)", "totalBooked")
                        .where("booking.ticket_type_id = :ticketId", {
                            ticketId: ticket.id,
                        })
                        .andWhere("booking.status = :status", {
                            status: BookingStatusEnum.CONFIRMED,
                        })
                        .getRawOne();
                const bookedForTicket = Number(ticketBookedResult.totalBooked) || 0;


                    (ticket as any).remainingSeats =
                        ticket.seatLimit - bookedForTicket;
                }
            }

                new ResponseGenerator(httpStatusCodes.OK, {
                    success:true,
                    message: "list of all events",
                    events: events 
                }).send(res)
            
            } catch(err){
                next(err);
            }
    }

    public static async listEventById(req:Request, res:Response, next:NextFunction){
        //can be accessed by anyone, no auth, no role required
        try{
            const eventId = Number(req.params.eventId);
            //event by id will need organizer info, reviews, reportedEvent, basically everything
            const event = await eventRepository.findOne({
                where: {id: eventId},
                relations:["organizer", "ticket_type", "reviews", "reviews.user", "reportedEvents"]
            })

            if (!event){
                throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "event not found")
            }
            

            const totalBookedResult = await bookingRepository
                .createQueryBuilder("booking")
                .leftJoin("booking.ticketType", "ticketType")
                .select("SUM(booking.quantity)", "totalBooked")
                .where("ticketType.event_id = :eventId", {eventId})
                .andWhere("booking.status = :status", {status: BookingStatusEnum.CONFIRMED})
                .getRawOne()

            const totalBooked = Number(totalBookedResult.totalBooked) || 0;
            (event as any).remainingCapacity =
            event.capacity != null ? event.capacity - totalBooked : null;

            for (const ticket of event.ticket_type) {
            const ticketBookedResult = await bookingRepository
                .createQueryBuilder("booking")
                .select("SUM(booking.quantity)", "totalBooked")
                .where("booking.ticket_type_id = :ticketId", {
                    ticketId: ticket.id,
                })
                .andWhere("booking.status = :status", {
                    status: BookingStatusEnum.CONFIRMED,
                })
                .getRawOne();

            const bookedSeats = Number(ticketBookedResult.totalBooked) || 0;

            (ticket as any).remainingSeats = ticket.seatLimit - bookedSeats;
        }

            new ResponseGenerator(httpStatusCodes.OK, {
                success:true,
                message: "event information",
                event: event
            }).send(res)
        }catch(err){
            next(err);
        }
    }

    public static async listUpcomingEvents(
    req: Request,
    res: Response,
    next: NextFunction
) {
    // can be accessed by anyone, doesn't have to be logged in
    try {
        const now = new Date();

        // optionally support ?limit=10
        const limit =
            req.query.limit && !isNaN(Number(req.query.limit))
                ? Number(req.query.limit)
                : undefined;

        const upcomingEvents = await eventRepository.find({
            where: {
                startDateTime: MoreThan(now),
            },
            relations: ["organizer", "ticket_type", "reviews"],
            order: {
                startDateTime: "ASC",
            },
            ...(limit ? { take: limit } : {}),
        });

         for (const event of upcomingEvents) {
        // --- remainingCapacity ---
        const totalBookedResult = await bookingRepository
          .createQueryBuilder("booking")
          .leftJoin("booking.ticketType", "ticketType")
          .select("SUM(booking.quantity)", "totalBooked")
          .where("ticketType.event_id = :eventId", { eventId: event.id })
          .andWhere("booking.status = :status", {
            status: BookingStatusEnum.CONFIRMED,
          })
          .getRawOne();

        const totalBooked = Number(totalBookedResult?.totalBooked) || 0;

        (event as any).remainingCapacity =
          event.capacity != null ? event.capacity - totalBooked : null;

        // --- remainingSeats per ticket type ---
        for (const ticket of event.ticket_type) {
          const ticketBookedResult = await bookingRepository
            .createQueryBuilder("booking")
            .select("SUM(booking.quantity)", "totalBooked")
            .where("booking.ticket_type_id = :ticketId", {
              ticketId: ticket.id,
            })
            .andWhere("booking.status = :status", {
              status: BookingStatusEnum.CONFIRMED,
            })
            .getRawOne();

          const bookedSeats = Number(ticketBookedResult?.totalBooked) || 0;

          (ticket as any).remainingSeats = ticket.seatLimit - bookedSeats;
        }
      }



        new ResponseGenerator(httpStatusCodes.OK, {
            success: true,
            message: "list of upcoming events",
            events: upcomingEvents,
        }).send(res);
    } catch (err) {
        next(err);
    }
}


    
public static async listOrgEvents(req: Request, res: Response, next: NextFunction) {
    logger.info("reaches list org");

    try {
        const organizer = req["user"];

        if (!organizer) {
            throw new ErrorHandler(httpStatusCodes.FORBIDDEN, "Authentication required");
        }

        // fetch events that belong to this organizer
        const events = await eventRepository.find({
        where: { organizer: { id: organizer.id } },
        relations: ["organizer", "ticket_type"],
        });


        console.log(organizer);
        //console.log(events);

        // ---- Add remainingCapacity + remainingSeats ----
        for (const event of events) {

            // remainingCapacity
            const totalBookedResult = await bookingRepository
                .createQueryBuilder("booking")
                .leftJoin("booking.ticketType", "ticketType")
                .select("SUM(booking.quantity)", "totalBooked")
                .where("ticketType.event_id = :eventId", { eventId: event.id })
                .andWhere("booking.status = :status", {
                    status: BookingStatusEnum.CONFIRMED,
                })
                .getRawOne();

            const totalBooked = Number(totalBookedResult?.totalBooked) || 0;

            (event as any).remainingCapacity =
                event.capacity != null ? event.capacity - totalBooked : null;

            // remainingSeats for each ticket type
            for (const ticket of event.ticket_type) {
                const ticketBookedResult = await bookingRepository
                    .createQueryBuilder("booking")
                    .select("SUM(booking.quantity)", "totalBooked")
                    .where("booking.ticket_type_id = :ticketId", {
                        ticketId: ticket.id,
                    })
                    .andWhere("booking.status = :status", {
                        status: BookingStatusEnum.CONFIRMED,
                    })
                    .getRawOne();

                const bookedSeats = Number(ticketBookedResult?.totalBooked) || 0;

                (ticket as any).remainingSeats = ticket.seatLimit - bookedSeats;
            }
        }

        new ResponseGenerator(httpStatusCodes.OK, {
            success: true,
            message: "List of organizer events",
            events,
        }).send(res);

    } catch (err) {
        next(err);
    }
}



    public static async createEvent(req: Request, res:Response, next:NextFunction){
  
        try{
      //auth required, organizer role required

        //auth attaches user to req
        const organizer = req["user"];

        const {title,description, location, category, startDateTime, bannerImageUrl, teasorVideoUrl, capacity} = req.body;
        
        const result = EventSchema.safeParse({location:location, category:category,title:title, description:description, startDateTime:startDateTime,bannerImageUrl:bannerImageUrl, teasorVideoUrl:teasorVideoUrl, capacity:capacity});
        
        console.log(result);

        if (!result.success){
            throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "All fields required")
        }

        const validated = result.data;

        const DEFAULT_BANNER =
        "https://upload.wikimedia.org/wikipedia/en/5/5d/AKIRA_%281988_poster%29.jpg";

        //create new event
        const newEvent = eventRepository.create({
            title: validated.title,
            description: validated.description,
            location: validated.location,
            category: validated.category,
            startDateTime: validated.startDateTime,
            bannerImageUrl: validated.bannerImageUrl ??  DEFAULT_BANNER,
            teasorVideoUrl: validated.teasorVideoUrl ?? null,
            organizer: organizer,
            capacity: validated.capacity
        })

        const savedEvent = await eventRepository.save(newEvent);

        new ResponseGenerator(httpStatusCodes.CREATED, {
            success:true,
            message: "Event created successfully",
            event: savedEvent
        }).send(res);


        }catch(err){
            next(err);
        }
    }

    public static async updateEvent(req:Request, res:Response, next:NextFunction){

        try{

            const organizer = req["user"];
            const eventId = Number(req.params.eventId);

            const event = await eventRepository.findOne({
                where:{id: eventId},
                relations: ["organizer"]
            })

            if (!event){
                throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Event not found")
            }

            if (event.organizer.id != organizer.id){
                throw new ErrorHandler(httpStatusCodes.FORBIDDEN, "You cannot edit this event")
            }

            const result = EventUpdateSchema.safeParse(req.body);

            if (!result.success){
                throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "Invalid event data")
            }

            const updates = result.data;

            Object.assign(event,updates) //update keys present

            const updatedEvent = await eventRepository.save(event);

            new ResponseGenerator(httpStatusCodes.OK, {
                success:true,
                message: "Event updated successfuly",
                event: updatedEvent,
            }).send(res);


        }catch(err){
            next(err);
        }
    }

    public static async deleteEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const organizer = req["user"];
        const eventId = Number(req.params.eventId);

        if (Number.isNaN(eventId)) {
            throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "Invalid event id");
        }

        const event = await eventRepository.findOne({
            where: { id: eventId },
            relations: ["organizer"],
        });

        if (!event) {
            throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Event not found");
        }

        if (event.organizer.id !== organizer.id) {
            throw new ErrorHandler(
                httpStatusCodes.FORBIDDEN,
                "You cannot delete this event"
            );
        }

        // Hard delete
        await eventRepository.remove(event);

        new ResponseGenerator(httpStatusCodes.OK, {
            success: true,
            message: "Event deleted successfully",
        }).send(res);
    } catch (err) {
        next(err);
    }
}

    public static async bookEventTicket(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = (req as any).user.id; // attendee
        const eventId = Number(req.params.eventId);

        const result = CreateBookingSchema.safeParse(req.body);
        if (!result.success){
            throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "Invalid booking data")
        }
        const { ticketTypeId, quantity } = result.data;

        // Ensure ticket type exists & load event
        const ticketType = await ticketRepository.findOne({
            where: { id: ticketTypeId },
            relations: ["event"],
        });

        if (!ticketType) {
            throw new ErrorHandler(
                httpStatusCodes.NOT_FOUND,
                "Ticket type not found"
            );
        }

        // Ticket type must belong to the event
        if (ticketType.event.id !== eventId) {
            throw new ErrorHandler(
                httpStatusCodes.BAD_REQUEST,
                "This ticket type does not belong to this event"
            );
        }

        // Load event to check capacity
        const event = ticketType.event;

        // Count existing bookings for this ticket type
        const ticketBookingsCount = await bookingRepository
            .createQueryBuilder("booking")
            .where("booking.ticket_type_id = :id", { id: ticketTypeId })
            .andWhere("booking.status = :status", {
                status: BookingStatusEnum.CONFIRMED,
            })
            .getCount();

        // Check seatLimit
        if (ticketBookingsCount + quantity > ticketType.seatLimit) {
            throw new ErrorHandler(
                httpStatusCodes.BAD_REQUEST,
                "Not enough seats available for this ticket type"
            );
        }

        // Check overall event capacity
        const allEventBookingsCount = await bookingRepository
            .createQueryBuilder("booking")
            .leftJoin("booking.ticketType", "ticketType")
            .where("ticketType.event_id = :eventId", { eventId })
            .andWhere("booking.status = :status", {
                status: BookingStatusEnum.CONFIRMED,
            })
            .getCount();

        if (allEventBookingsCount + quantity > event.capacity) {
            throw new ErrorHandler(
                httpStatusCodes.BAD_REQUEST,
                "Event is fully booked or does not have enough capacity"
            );
        }

        // Create booking
        const totalPrice = Number(ticketType.price) * quantity;

        const booking = bookingRepository.create({
            user: { id: userId } as any,
            ticketType: { id: ticketTypeId } as any,
            quantity,
            totalPrice,
            status: BookingStatusEnum.CONFIRMED,
        });

        const savedBooking = await bookingRepository.save(booking);

        new ResponseGenerator(httpStatusCodes.CREATED, {
            success: true,
            message: "Booking successful",
            booking: savedBooking,
        }).send(res);

    } catch (err) {
        next(err);
    }
}


    public static async getEventAttendees(req:Request,res:Response, next:NextFunction){
        try {
            const organizerId = (req as any).user.id;
            const eventId = Number(req.params.eventId);

            const event = await eventRepository.findOne({
                where: {id: eventId},
                relations: ["organizer"]
            });

            if (!event){
                throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Event not found")
            }

            if (event.organizer.id != organizerId){
                throw new ErrorHandler(httpStatusCodes.FORBIDDEN,
                    "You cannot access attendees of another organizer's events"
                )
            }

            const bookings = await bookingRepository.find({
                where: {ticketType: {event: {id: eventId}}},
                relations: ["user", "ticketType"]
            });

            const attendees = bookings.map((b) => ({
                bookingId: b.id,
                userId: b.user.id,
                name: b.user.name,
                email: b.user.email,
                ticketType: b.ticketType.name,
                quantity: b.quantity,
                totalPrice: b.totalPrice,
                bookedAt: b.createdAt

            }))

            return new ResponseGenerator(httpStatusCodes.OK, {
                success:true,
                message: "Attendee list fetched",
                eventId: eventId,
                attendees: attendees
            }).send(res);
        } catch(err){
            next(err);
        }
    }


    public static async searchEvents(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            q,
            category,
            location,
            minCapacity,
            startDate,
            endDate,
            page = 1,
            limit = 10,
        } = req.query;

        const qb = eventRepository
            .createQueryBuilder("event")
            .leftJoinAndSelect("event.organizer", "organizer")
            .leftJoinAndSelect("event.ticket_type", "ticketType")
            .where("event.isBlocked = false");

        // keyword search
        if (q) {
            qb.andWhere(
                "(event.title ILIKE :q OR event.description ILIKE :q OR event.location ILIKE :q OR event.category ILIKE :q)",
                { q: `%${q}%` }
            );

        }

        // category
        if (category) {
            qb.andWhere("event.category ILIKE :category", { category: `%${category}%` });
        }

        // location
        if (location) {
            qb.andWhere("event.location ILIKE :location", { location: `%${location}%` });
        }

        // min capacity
        if (minCapacity) {
            qb.andWhere("event.capacity >= :minCapacity", { minCapacity: Number(minCapacity) });
        }

        // date range
        if (startDate) {
            qb.andWhere("event.startDateTime >= :startDate", { startDate });
        }
        if (endDate) {
            qb.andWhere("event.startDateTime <= :endDate", { endDate });
        }

        // pagination
        qb.skip((Number(page) - 1) * Number(limit)).take(Number(limit));

        const events = await qb.getMany();

        // attach remaining capacities just like your listAllEvents()
        for (const event of events) {
            const totalBookedResult = await bookingRepository
                .createQueryBuilder("booking")
                .leftJoin("booking.ticketType", "ticketType")
                .select("SUM(booking.quantity)", "totalBooked")
                .where("ticketType.event_id = :eventId", { eventId: event.id })
                .andWhere("booking.status = :status", {
                    status: BookingStatusEnum.CONFIRMED,
                })
                .getRawOne();

            const totalBooked = Number(totalBookedResult.totalBooked) || 0;

            (event as any).remainingCapacity =
                event.capacity != null ? event.capacity - totalBooked : null;

            for (const ticket of event.ticket_type) {
                const ticketBookedResult = await bookingRepository
                    .createQueryBuilder("booking")
                    .select("SUM(booking.quantity)", "totalBooked")
                    .where("booking.ticket_type_id = :ticketId", {
                        ticketId: ticket.id,
                    })
                    .andWhere("booking.status = :status", {
                        status: BookingStatusEnum.CONFIRMED,
                    })
                    .getRawOne();

                const bookedSeats = Number(ticketBookedResult.totalBooked) || 0;
                (ticket as any).remainingSeats = ticket.seatLimit - bookedSeats;
            }
        }

        new ResponseGenerator(httpStatusCodes.OK, {
            success: true,
            message: "Search results",
            events,
        }).send(res);
    } catch (err) {
        next(err);
    }
}




    






}