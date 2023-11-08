import {
  HttpCode,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductImage } from './entities/product-image.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { promisify } from 'util';
const unlinkAsync = promisify(fs.unlink);

@Injectable()
export class ProductImageService {
  constructor(
    @InjectRepository(ProductImage)
    private productImageRepository: Repository<ProductImage>,
  ) {}
  create(createProductImageDto: CreateProductImageDto) {
    return 'This action adds a new productImage';
  }

  async findAll() {
    return await this.productImageRepository.find({
      relations: ['product'],
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} productImage`;
  }

  update(id: number, updateProductImageDto: UpdateProductImageDto) {
    return `This action updates a #${id} productImage`;
  }

  async remove(id: number) {
    const productImage = await this.productImageRepository.findOneBy({ id });

    if (!productImage) {
      throw new NotFoundException('Product Image not found');
    }

    const url = productImage.filename;
    const regex = /product-image\/(.+)$/;
    const match = url.match(regex);

    if (match) {
      const filePath = match[1];

      try {
        await unlinkAsync(filePath); // Use promisified fs.unlink for asynchronous handling
        console.log('File deleted successfully');
      } catch (error) {
        console.error('Error deleting file:', error);
        throw new HttpException('Error deleting file', HttpStatus.FORBIDDEN);
      }

      await this.productImageRepository.remove(productImage);
      return HttpStatus.OK;
    } else {
      console.log('Pattern not found in the URL.');
    }
  }
}
