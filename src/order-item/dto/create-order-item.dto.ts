import { IsNumber, IsObject, IsUUID } from 'class-validator';
import { Product } from 'src/products/entities/product.entity';

export class CreateOrderItemDto {
  // @IsUUID()
  // product_id: string;
  @IsUUID()
  order_id: string;
  @IsObject()
  product: Product;
  @IsNumber()
  quantity: number;
}
