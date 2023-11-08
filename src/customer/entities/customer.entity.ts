import { IsOptional, IsString } from 'class-validator';
import { Order } from 'src/order/entities/order.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsString()
  name: string;

  @Column({ default: 'Female' })
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

  @OneToMany(() => Order, (order) => order.customer)
  order: Order[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @VersionColumn()
  version: number;
}
