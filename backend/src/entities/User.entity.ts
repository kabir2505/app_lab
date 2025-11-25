import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { UserRole } from "../utils/Enums";
//typeorm uses this to create tables, generate columns, run queries
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ type: "enum", enum: UserRole})
    role: UserRole;

    @Column({ nullable: true})
    login_otp: number;

    @Column({ nullable: true, type: "timestamptz"})
    login_otp_expiry: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // @OneToOne(
    //     () => 
    // )

}