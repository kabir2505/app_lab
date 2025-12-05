//user, organization name, bio/about, verified
import { Column, PrimaryGeneratedColumn, Entity, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToOne } from "typeorm";
import {User} from "./User.entity"


@Entity("organizer_profiles")
export class OrganizerProfile{
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, (user) => user.organizerProfile )
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column({nullable:true})
    organizationName: string | null;

    @Column({nullable: true})
    website: string | null;

    @Column({nullable: true})
    bio: string | null

    @Column({type: "boolean", default:false})
    isApproved: boolean;

}
