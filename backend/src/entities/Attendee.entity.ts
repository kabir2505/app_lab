//user, organization name, bio/about, verified
import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, OneToOne } from "typeorm";
import {User} from "./User.entity"


@Entity("attendee_profiles")
export class AttendeeProfile{
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, (user) => user.attendeeProfile )
    user: User

    @Column({type: "text", nullable: true})
    preferences: string;

    @Column({nullable: true})
    bio: string;

    @Column({nullable:true})
    avatarUrl: string;

}
