//user, organization name, bio/about, verified
import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, OneToOne, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import {User} from "./User.entity"
import { Booking } from "./Booking.Entity";
import { Review } from "./Review.Entity";
import { TicketType } from "./TicketType.entity";
import { ReportedEvent } from "./ReportedEvent.entity";

@Entity("events")
export class Event{
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.events)
    @JoinColumn({ name: "organizer_id" })
    organizer: User

    @Column()
    title: string;

    @Column({type: "text"})
    description: string;

    @Column({default:"https://upload.wikimedia.org/wikipedia/en/5/5d/AKIRA_%281988_poster%29.jpg"})
    bannerImageUrl: string;

    @Column({ nullable: true})
    teasorVideoUrl: string;

    @Column()
    location: string;

    @Column()
    category: string;

    @Column({type: "timestamptz"})
    startDateTime: Date;

    @Column({ nullable:true})
    capacity: number | null

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({default:false, nullable:true})
    isBlocked:boolean;

    @OneToMany(() => TicketType, (ticket) => ticket.event)
    ticket_type: TicketType[];

    @OneToMany(()=>Review, (review) => review.event)
    reviews: Review[]

    @OneToMany(()=>ReportedEvent,(rEvent)=> rEvent.event)
    reportedEvents: ReportedEvent[]

}
