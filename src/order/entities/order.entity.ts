import { Customer } from 'src/customer/entities/customer.entity';
import { OrderItem } from 'src/order-item/entities/order-item.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  created_by_user_id: string;

  @ManyToOne(() => User, (user) => user.order)
  @JoinColumn({ name: 'created_by_user_id' })
  created_by_user: User;

  @Column({ type: 'uuid' })
  customer_id: string;

  @ManyToOne(() => Customer, (customer) => customer.order)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  order_items: OrderItem[];

  @Column({ type: 'decimal', default: 0, precision: 10, scale: 2 })
  total_price: number;

  @Column({ type: 'decimal', default: 0, precision: 10, scale: 2 })
  total_discount_price: number;

  @Column({ type: 'decimal', default: 0, precision: 10, scale: 2 })
  total_unit: number;

  @Column({ type: 'boolean', default: false})
  is_order_placed: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @VersionColumn()
  version: number;
}
