import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  NotFoundException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptionsProducts } from 'src/utils/multerOptions';
import { MaxImagesInterceptor } from 'src/utils/interceptors/maxImageInterceptor';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get('deleted')
  findAllDeleted() {
    return this.productsService.findAllDeleted();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOneById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // return this.productsService.remove(id);
    return this.productsService.softDeleteProduct(id);
  }

  @Post(':id/undelete')
  async undeleteProduct(@Param('id') id: string): Promise<void> {
    await this.productsService.undeleteProduct(id);
  }

  @Post(':productId/images')
  @UseInterceptors(
    FilesInterceptor('images', 10, multerOptionsProducts),
    MaxImagesInterceptor,
  )
  async uploadImages(
    @UploadedFiles() images,
    @Param('productId') productId: string,
  ) {
    if (images.length === 0) {
      throw new NotFoundException('No file uploaded');
    }
    return this.productsService.uploadImages(productId, images);
  }
}
