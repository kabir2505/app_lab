import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { UserRole } from "../utils/Enums";
import { OrganizerProfile } from "./Organizer.entity";
import { AttendeeProfile } from "./Attendee.entity";
import { Review } from "./Review.Entity";
import {Event} from "./Event.entity"
import { Booking } from "./Booking.Entity";
import { ReportedEvent } from "./ReportedEvent.entity";
//typeorm uses this to create tables, generate columns, run queries
@Entity("users") //stored as users inside the database
export class User { //call User not users
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    passwordHash: string;

    @Column({ type: "enum", enum: UserRole, default:UserRole.VIEWER})
    role: UserRole;

    // @Column({ nullable: true})
    // login_otp: number;

    // @Column({ nullable: true, type: "timestamptz"})
    // login_otp_expiry: Date;


    @OneToOne(() => OrganizerProfile, (profile) => profile.user)
    @JoinColumn({name: "orgprofile_id"})
    organizerProfile: OrganizerProfile; //user.organizerProfile

    @OneToOne(() => AttendeeProfile, (profile) => profile.user)
    @JoinColumn({name: "attprofile_id"})
    attendeeProfile: AttendeeProfile; //user.attendeeProfile

    //admin doesnt need a profile

    @OneToMany(() => Review, (review) => review.user)
    reviews: Review [];

    @OneToMany(() => Event, (event) => event.organizer)
    events: Event[];

    @OneToMany(() => Booking, (booking) => booking.user)
    bookings: Booking[];

    @OneToMany(() => ReportedEvent, (reported)=> reported.user)
    reportedEvents: ReportedEvent[];



    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}