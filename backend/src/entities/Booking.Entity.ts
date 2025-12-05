//user, organization name, bio/about, verified
import { Column, PrimaryGeneratedColumn,JoinColumn, Entity, CreateDateColumn, UpdateDateColumn, OneToOne, ManyToOne } from "typeorm";
import {User} from "./User.entity"
import { TicketType } from "./TicketType.entity";
import { BookingStatusEnum } from "../utils/Enums";

@Entity()
export class Booking{
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.bookings)
    @JoinColumn({ name: "user_id" })
    user: User

    @ManyToOne(() => TicketType, (ticket) => ticket.bookings, {onDelete: "CASCADE"})
    @JoinColumn({ name: "ticket_type_id" })
    ticketType: TicketType;

    @Column()
    quantity: number;

    @Column({type: "numeric"})
    totalPrice: number;

    @Column({type: "enum", enum:BookingStatusEnum, default:BookingStatusEnum.CONFIRMED })
    status: BookingStatusEnum; //confirmed /cancelled
    
    @CreateDateColumn()
    createdAt: Date;
}

// booking.ticketType      // ✅ exists
// booking.ticket_type_id  // ❌ does NOT exist

// repository.find({ where: {...} }) world → entity properties

// createQueryBuilder("booking") world → raw SQL column names / aliases