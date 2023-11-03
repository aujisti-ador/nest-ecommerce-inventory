import { Exclude } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { Role } from 'src/enums/role.enum';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    VersionColumn,
} from 'typeorm';

@Entity()
export class Customer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @IsString()
    name: string;

    @Column({default: 'Female'})
    @IsString()
    gender: string;

    @IsOptional()
    @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
    email: string;

    @Column({ unique: true })
    phone: string;

    @Column()
    @IsString()
    district: string;

    @Column()
    @IsString()
    division: string;

    @Column()
    @IsString()
    address: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @VersionColumn()
    version: number;
}
