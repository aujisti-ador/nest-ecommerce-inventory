import { IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { OrderStatusType } from "src/enums/orderStatusType.enum";
import { Order } from "src/order/entities/order.entity";

export class CreateOrderStatusDto {
    @IsOptional()
    order: Order

    @IsNotEmpty()
    @IsEnum(OrderStatusType)
    status: OrderStatusType
}
