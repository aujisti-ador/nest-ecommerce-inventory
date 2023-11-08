import { Exclude } from 'class-transformer';
import { IsString } from 'class-validator';
import { Role } from 'src/enums/role.enum';
import { Order } from 'src/order/entities/order.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';

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
    default: Role.USER,
  })
  roles: Role;

  @OneToMany(() => Order, (order) => order.created_by_user)
  @JoinColumn({ name: 'order_id' })
  order: Order[];

  @Column()
  @Exclude({ toPlainOnly: true }) // Exclude password when transforming to plain object
  password: string;

  @Column({
    default: null,
  })
  @Exclude()
  currentHashedRefreshToken?: string;

  @Column()
  avatar: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @VersionColumn()
  version: number;
}
