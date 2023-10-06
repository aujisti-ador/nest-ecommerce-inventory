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
    @IsString()
    first_name: string;

    @Column()
    @IsString()
    last_name: string;

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.USER
    })
    roles: Role;

    @Column()
    @Exclude({ toPlainOnly: true }) // Exclude password when transforming to plain object
    password: string;

    @Column({
        default: null
    })
    @Exclude()
    currentHashedRefreshToken?: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @VersionColumn()
    version: number;
}
