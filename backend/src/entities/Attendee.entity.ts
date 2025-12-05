//user, organization name, bio/about, verified
import { Column, PrimaryGeneratedColumn, JoinColumn, Entity, CreateDateColumn, UpdateDateColumn, OneToOne } from "typeorm";
import {User} from "./User.entity"


@Entity("attendee_profiles")
export class AttendeeProfile{
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, (user) => user.attendeeProfile )
    @JoinColumn({ name: "user_id" })
    user: User

    @Column({type: "text", nullable: true})
    preferences: string | null;

    @Column({nullable: true})
    bio: string | null;

    @Column({nullable:true})
    avatarUrl: string | null;

}
