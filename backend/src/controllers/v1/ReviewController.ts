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
import { reviewRepository } from "../../utils/Repositories";
import { eventRepository } from "../../utils/Repositories";

const CreateReviewSchema = z.object({
    rating: z.number().min(1).max(5),
    comment: z.string().max(1000).nullable().optional(),
    mediaUrls: z.array(z.string().url()).optional().nullable(),
});
const UpdateReviewSchema = z.object({
    rating: z.number().min(1).max(5).optional(),
    comment: z.string().max(1000).nullable().optional(),
    mediaUrls: z.array(z.string().url()).nullable().optional()
});

export class ReviewController{
    public static async leaveReview(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = (req as any).user.id;
        const eventId = Number(req.params.eventId);

        if (isNaN(eventId)) {
            throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "Invalid eventId");
        }

        // Validate request body
        const result = CreateReviewSchema.safeParse(req.body);
        if (!result.success) {
            throw new ErrorHandler(
                httpStatusCodes.BAD_REQUEST,
                "Invalid review fields"
            );
        }
        const { rating, comment, mediaUrls } = result.data;

        // 1. Check event exists
        const event = await eventRepository.findOne({
            where: { id: eventId },
        });

        if (!event) {
            throw new ErrorHandler(
                httpStatusCodes.NOT_FOUND,
                "Event not found"
            );
        }

        // 2. Verify user attended (has CONFIRMED booking)
        const attended = await bookingRepository
            .createQueryBuilder("booking")
            .leftJoin("booking.ticketType", "ticketType")
            .where("booking.user_id = :userId", { userId })
            .andWhere("ticketType.event_id = :eventId", { eventId })
            .andWhere("booking.status = :status", { status: "confirmed" })
            .getCount();

        if (attended === 0) {
            throw new ErrorHandler(
                httpStatusCodes.FORBIDDEN,
                "You cannot review an event you did not attend"
            );
        }

        // 3. Prevent duplicate review by same user
        const existingReview = await reviewRepository.findOne({
            where: {
                user: { id: userId },
                event: { id: eventId },
            },
        });

        if (existingReview) {
            throw new ErrorHandler(
                httpStatusCodes.BAD_REQUEST,
                "You have already reviewed this event"
            );
        }

        // 4. Create review
        const review = reviewRepository.create({
            rating,
            comment: comment ?? null,
            mediaUrls: mediaUrls ?? [],
            user: { id: userId } as any,
            event: { id: eventId } as any,
        });

        const savedReview = await reviewRepository.save(review);

        return new ResponseGenerator(httpStatusCodes.CREATED, {
            success: true,
            message: "Review submitted successfully",
            review: savedReview,
        }).send(res);

    } catch (err) {
        next(err);
    }
}


    public static async updateReview(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = (req as any).user.id;
        const eventId = Number(req.params.eventId);
        const reviewId = Number(req.params.reviewId);

        if (isNaN(eventId) || isNaN(reviewId)) {
            throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "Invalid event or review ID");
        }

        
        const result = UpdateReviewSchema.safeParse(req.body);
        if (!result.success) {
            throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "Invalid update fields");
        }

        const updates = result.data;

        
        const review = await reviewRepository.findOne({
            where: { id: reviewId },
            relations: ["user", "event"],
        });

        if (!review) {
            throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Review not found");
        }

       
        if (review.event.id !== eventId) {
            throw new ErrorHandler(
                httpStatusCodes.BAD_REQUEST,
                "Review does not belong to this event"
            );
        }

      
        if (review.user.id !== userId) {
            throw new ErrorHandler(
                httpStatusCodes.FORBIDDEN,
                "You cannot update someone else's review"
            );
        }

    
        Object.assign(review, updates);

        const updatedReview = await reviewRepository.save(review);

        return new ResponseGenerator(httpStatusCodes.OK, {
            success: true,
            message: "Review updated successfully",
            review: updatedReview,
        }).send(res);
    } catch (err) {
        next(err);
    }
}

    public static async deleteReview(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = (req as any).user.id;
        const eventId = Number(req.params.eventId);
        const reviewId = Number(req.params.reviewId);

        if (isNaN(eventId) || isNaN(reviewId)) {
            throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "Invalid event or review ID");
        }

        const review = await reviewRepository.findOne({
            where: { id: reviewId },
            relations: ["user", "event"],
        });

        if (!review) {
            throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Review not found");
        }

        // Check event belongs
        if (review.event.id !== eventId) {
            throw new ErrorHandler(
                httpStatusCodes.BAD_REQUEST,
                "Review does not belong to this event"
            );
        }

        // Ownership check
        if (review.user.id !== userId) {
            throw new ErrorHandler(
                httpStatusCodes.FORBIDDEN,
                "You cannot delete someone else's review"
            );
        }

        await reviewRepository.remove(review);

        return new ResponseGenerator(httpStatusCodes.OK, {
            success: true,
            message: "Review deleted successfully",
        }).send(res);

    } catch (err) {
        next(err);
    }
}



}