import { Module } from '@nestjs/common';
import { OrderItemService } from './order-item.service';
import { OrderItemController } from './order-item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './entities/order-item.entity';
import { OrderModule } from 'src/order/order.module';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([OrderItem]), OrderModule, ProductsModule],
  controllers: [OrderItemController],
  providers: [OrderItemService],
})
export class OrderItemModule {}
