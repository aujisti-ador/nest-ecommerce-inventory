import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { CategoriesModule } from 'src/categories/categories.module';
import { ProductImage } from 'src/product-image/entities/product-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductImage]), CategoriesModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule { }
