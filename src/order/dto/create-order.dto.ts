import { IsArray, IsUUID } from 'class-validator';
import { OrderItem } from 'src/order-item/entities/order-item.entity';

export class CreateOrderDto {
  @IsUUID()
  created_by_user_id: string;
  @IsUUID()
  customer_id: string;
}
