import { IsArray, IsBoolean, IsDecimal, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { OrderItem } from 'src/order-item/entities/order-item.entity';

export class CreateOrderDto {
  @IsUUID()
  created_by_user_id: string;

  @IsUUID()
  customer_id: string;

  @IsDecimal()
  @IsOptional()
  total_price: number;

  @IsNumber()
  @IsOptional()
  total_unit: number;
  
  @IsBoolean()
  @IsOptional()
  is_order_placed: boolean;
}
