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
import { ReportedEventEnum } from "../../utils/Enums";
//REPOSITORIES
import { attendeeProfileRepository, bookingRepository, userRepository } from "../../utils/Repositories";
import { AuthHelper } from "../../utils/AuthHelper";
import logger from "../../utils/logger";
import { TicketType } from "../../entities/TicketType.entity"; 
import { reviewRepository } from "../../utils/Repositories";
import { eventRepository } from "../../utils/Repositories";
import { reportedEventRepository } from "../../utils/Repositories";
import { ReportedEvent } from "../../entities/ReportedEvent.entity";

const ReportEventSchema = z.object({
    reason: z.string().min(5).max(500),
});

export class ReportEventController{
    public static async reportEvent(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = (req as any).user.id;
        const role = (req as any).user.role;
        const eventId = Number(req.params.eventId);
                if (isNaN(eventId)) {
            throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "Invalid event ID");
        }

        // Validate input
        const result = ReportEventSchema.safeParse(req.body);
        if (!result.success) {
            throw new ErrorHandler(
                httpStatusCodes.BAD_REQUEST,
                "Invalid report reason"
            );
        }
        const { reason } = result.data;

        // Check if event exists
        const event = await eventRepository.findOne({
            where: { id: eventId },
        });

        if (!event) {
            throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Event not found");
        }

        // Prevent duplicate report from same user
        const existing = await reportedEventRepository.findOne({
            where: {
                user: { id: userId },
                event: { id: eventId },
            },
        });

        if (existing) {
            throw new ErrorHandler(
                httpStatusCodes.BAD_REQUEST,
                "You have already reported this event"
            );
        }

        const hasBooking = await bookingRepository
        .createQueryBuilder("booking")
        .leftJoin("booking.ticketType", "ticketType")
        .where("booking.user_id = :userId", { userId })
        .andWhere("ticketType.event_id = :eventId", { eventId })
        .getCount();

        if (hasBooking === 0) {
            throw new ErrorHandler(
                httpStatusCodes.FORBIDDEN,
                "You can only report events you attended"
            );
        }

        // Create report
        const newReport = reportedEventRepository.create({
            user: { id: userId } as any,
            event: { id: eventId } as any,
            reason,
            status: ReportedEventEnum.PENDING,
        });

        const saved = await reportedEventRepository.save(newReport);

        return new ResponseGenerator(httpStatusCodes.CREATED, {
            success: true,
            message: "Event reported successfully",
            report: saved,
        }).send(res);

    } catch (err) {
        next(err);
    }
}


    public static async getReportedEvents(
        req:Request, res:Response, next:NextFunction
    ) {
        try{
            //only admin can
            const user = (req as any).user;
            
            const statusFilter = req.query.status as string | undefined;

            const reports = await reportedEventRepository.find({
            where: statusFilter ? { status: statusFilter as ReportedEventEnum } : undefined,
            relations: ["user", "event", "event.organizer"],
            })
            
        const formattedReports = reports.map((r) => ({
            id: r.id,
            reason: r.reason,
            status: r.status,
            reportedAt: r.createdAt,

            reportedBy: {
                id: r.user.id,
                name: r.user.name,
                email: r.user.email
            },

            event: {
                id: r.event.id,
                title: r.event.title,
                category: r.event.category,
                location: r.event.location,
                startDateTime: r.event.startDateTime
            },

            organizer: {
                id: r.event.organizer.id,
                name: r.event.organizer.name,
                email: r.event.organizer.email
            }
        }));

        return new ResponseGenerator(httpStatusCodes.OK, {
            success: true,
            message: "Reported events fetched",
            reports: formattedReports
        }).send(res);
 
        } catch (err){
            next(err);
        }
    }


    public static async resolveReportedEvent(req:Request, res:Response, next:NextFunction){
        try {
            const admin = (req as any).user;

            const reportId = Number(req.params.id);
            
            const report = await reportedEventRepository.findOne({
                where: {id: reportId},
                relations: ["event", "user"]
            });

            if (!report){
                throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Report NOT Found")
            }

            if (report.status !== ReportedEventEnum.PENDING){
                throw new ErrorHandler(
                    httpStatusCodes.BAD_REQUEST,
                    "Only pending reports can be resolved"
                );
            }

            report.status = ReportedEventEnum.RESOLVED

            const updated = await reportedEventRepository.save(report);

            report.event.isBlocked = true;
            await eventRepository.save(report.event);
            
            return new ResponseGenerator(httpStatusCodes.OK, {
                success: true,
                message: "Report resolved successfully",
                report: updated
            }).send(res);

 
        } catch(err){
            next(err);
        }
    }

public static async rejectReportedEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const reportId = Number(req.params.id);

        const report = await reportedEventRepository.findOne({
            where: { id: reportId },
            relations: ["event", "user"]
        });

        if (!report) {
            throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Report not found");
        }

        if (report.status !== ReportedEventEnum.PENDING) {
            throw new ErrorHandler(
                httpStatusCodes.BAD_REQUEST,
                "Only pending reports can be rejected"
            );
        }

        report.status = ReportedEventEnum.REJECTED;

        const updated = await reportedEventRepository.save(report);

        return new ResponseGenerator(httpStatusCodes.OK, {
            success: true,
            message: "Report rejected successfully",
            report: updated
        }).send(res);

    } catch (err) {
        next(err);
    }
}

    public static async updateReportStatus(req: Request, res: Response, next: NextFunction) {
    try {
        const reportId = Number(req.params.id);
        const { status } = req.body;

        if (!["pending", "resolved", "rejected"].includes(status)) {
            throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "Invalid status");
        }

        const report = await reportedEventRepository.findOne({
            where: { id: reportId },
            relations: ["event", "event.reportedEvents"]
        });

        if (!report) {
            throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Report not found");
        }

        // Update report status
        report.status = status as ReportedEventEnum;
        await reportedEventRepository.save(report);

        // EVENT BLOCKING BEHAVIOR
        if (status === "resolved") {
            report.event.isBlocked = true;
            await eventRepository.save(report.event);
        } else if (status === "rejected") {
            // Unblock event ONLY if NO other 'resolved' reports exist
            const hasResolved = report.event.reportedEvents.some(
                (r) => r.status === ReportedEventEnum.RESOLVED && r.id !== reportId
            );

            if (!hasResolved) {
                report.event.isBlocked = false;
                await eventRepository.save(report.event);
            }
        }

        return new ResponseGenerator(httpStatusCodes.OK, {
            success: true,
            message: `Report updated to ${status}`,
            report
        }).send(res);

    } catch (err) {
        next(err);
    }
}


}