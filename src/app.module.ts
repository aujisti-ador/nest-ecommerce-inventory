import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductImageModule } from './product-image/product-image.module';
import { CustomerModule } from './customer/customer.module';
import { OrderItemModule } from './order-item/order-item.module';
import { OrderModule } from './order/order.module';
import { User } from './users/entities/user.entity';
import { Product } from './products/entities/product.entity';
import { Category } from './categories/entities/category.entity';
import { ProductImage } from './product-image/entities/product-image.entity';
import { Customer } from './customer/entities/customer.entity';
import { Order } from './order/entities/order.entity';
import { OrderItem } from './order-item/entities/order-item.entity';
import { DeliveryStatusModule } from './delivery-status/delivery-status.module';
import { DeliveryStatus } from './delivery-status/entities/delivery-status.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: 3306,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      synchronize: true,
      autoLoadEntities: true,
    }),
    UsersModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    ProductImageModule,
    CustomerModule,
    OrderItemModule,
    OrderModule,
    DeliveryStatusModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
