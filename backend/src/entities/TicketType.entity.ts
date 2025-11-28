//user, organization name, bio/about, verified
import { Column, PrimaryGeneratedColumn, Entity,JoinColumn, CreateDateColumn, UpdateDateColumn, OneToOne, ManyToOne, OneToMany } from "typeorm";
import {User} from "./User.entity"
import {Event} from "./Event.entity"
import { TicketTypeEnum } from "../utils/Enums";
import { Booking } from "./Booking.Entity";

@Entity("ticket_types")
export class TicketType{
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Event, (event) => event.ticket_type)
    @JoinColumn({ name: "event_id" })
    event: Event;
    
    @Column({type: "enum", enum: TicketTypeEnum, default:TicketTypeEnum.REGULAR})
    name: TicketTypeEnum;

    @Column({type: "numeric", default:0})
    price: number;

    @Column()
    seatLimit: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Booking, (booking) => booking.ticketType)
    bookings: Booking[]


}
