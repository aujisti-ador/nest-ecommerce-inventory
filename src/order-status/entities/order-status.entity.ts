import { OrderStatusType } from "src/enums/orderStatusType.enum";
import { Order } from "src/order/entities/order.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn, VersionColumn } from "typeorm";

@Entity('order_status')
export class OrderStatus {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => Order, (order) => order.order_status, { onDelete: "CASCADE" })
    order: Order;

    @Column({
        type: 'enum',
        enum: OrderStatusType,
        default: OrderStatusType.PENDING,
    })
    status: OrderStatusType;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @VersionColumn()
    version: number;
}
