//user, organization name, bio/about, verified
import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import {User} from "./User.entity"
import {Event} from "./Event.entity"
import { ReportedEventEnum } from "../utils/Enums";

@Entity("reported_events")
export class ReportedEvent{
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.reportedEvents)
    @JoinColumn({name: "reported_by_user"})
    user: User

    @ManyToOne(()=>Event, (event) => event.reportedEvents, {onDelete: "CASCADE"})
    @JoinColumn({name: "event_id"})
    event:Event;

    @Column({type: "text"})
    reason: string;

    @Column({type: "enum", enum:ReportedEventEnum})
    status:ReportedEventEnum

    @CreateDateColumn()
    createdAt:Date;
    
}
