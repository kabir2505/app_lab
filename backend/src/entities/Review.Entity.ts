//user, organization name, bio/about, verified
import { Column, PrimaryGeneratedColumn,JoinColumn, Entity, CreateDateColumn, UpdateDateColumn, OneToOne, ManyToOne } from "typeorm";
import {User} from "./User.entity"
import { Event } from "./Event.entity";

@Entity("reviews")
export class Review{
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.reviews)
    @JoinColumn({ name: "user_id" })
    user: User

    @ManyToOne(()=>Event, (event)=> event.reviews)
    @JoinColumn({ name: "event_id" })
    event: Event;

    @Column()
    rating: number;

    @Column({type: "text", nullable:true})
    comment: string

    @Column({type: "jsonb", nullable:true})
    mediaUrls: string[];

    @CreateDateColumn()
    createdAt: Date;
}
