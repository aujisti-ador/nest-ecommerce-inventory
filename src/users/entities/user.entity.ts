import { Exclude } from 'class-transformer';
import { IsString } from 'class-validator';
import { Role } from 'src/enums/role.enum';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column({ unique: true })
    phone: string;

    @Column()
    first_name: string;

    @Column()
    last_name: string;

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.USER
    })
    roles: Role

    @Column()
    @IsString()
    @Exclude({ toPlainOnly: true })
    password: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @VersionColumn()
    version: number
}