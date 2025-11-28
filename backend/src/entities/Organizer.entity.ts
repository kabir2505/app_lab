//user, organization name, bio/about, verified
import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, OneToOne } from "typeorm";
import {User} from "./User.entity"


@Entity("organizer_profiles")
export class OrganizerProfile{
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, (user) => user.organizerProfile )
    user: User;

    @Column({nullable:true})
    organizationName: string;

    @Column({nullable: true})
    website: string;

    @Column({nullable: true})
    bio: string
}
