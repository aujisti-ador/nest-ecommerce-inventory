import { Controller, Get, Post, Body, Patch, Param, Delete, Res, NotFoundException } from '@nestjs/common';
import { ProductImageService } from './product-image.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import * as fs from 'fs';

@Controller('product-image')
export class ProductImageController {
  constructor(private readonly productImageService: ProductImageService) {}

  @Post()
  create(@Body() createProductImageDto: CreateProductImageDto) {
    return this.productImageService.create(createProductImageDto);
  }

  @Get()
  findAll() {
    return this.productImageService.findAll();
  }

  @Get('products/:fileId')
  async serveAvatar(@Param('fileId') fileId, @Res() res): Promise<any> {
    try {
      const filePath = `products/${fileId}`;
      if (!fs.existsSync(filePath)) {
        throw new NotFoundException('Product Image not found');
      }
      res.sendFile(fileId, { root: 'products' });
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(error.getStatus()).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductImageDto: UpdateProductImageDto) {
    return this.productImageService.update(+id, updateProductImageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.productImageService.remove(+id);
  }
}
