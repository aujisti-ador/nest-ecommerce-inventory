import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { CategoriesService } from 'src/categories/categories.service';
import { ProductImage } from 'src/product-image/entities/product-image.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private productImageRepository: Repository<ProductImage>,
    private readonly categoryService: CategoriesService,
  ) { }

  async create(createProductDto: CreateProductDto) {
    try {
      return await this.productRepository.save(createProductDto);
    } catch (error) {
      console.log('Error creating Product', error);
      if (error instanceof HttpException) {
        throw error; // Re-throw HttpExceptions as-is
      } else {
        throw new InternalServerErrorException('Failed to create product');
      }
    }
  }

  async findAll(): Promise<Product[]> {
    try {
      return await this.productRepository.find({
        relations: ['category', 'images'],
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new NotFoundException('Failed to fetch products');
    }
  }

  async findAllDeleted(): Promise<Product[]> {
    try {
      return await this.productRepository.find({
        withDeleted: true,
        where: {
          deletedAt: Not(IsNull()), // Filter soft-deleted records
        },
        relations: ['category', 'images'],
      });
    } catch (error) {
      console.error('Error fetching deleted products:', error);

      if (error.name === 'EntityNotFound') {
        throw new NotFoundException('Deleted products not found');
      }
      throw new HttpException('Failed to fetch deleted products', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOneById(id: string) {
    try {
      const product = await this.productRepository.findOne({
        where: { id: id },
        relations: ['images', 'orderItems'],
        withDeleted: true,
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }
      return product;
    } catch (error) {
      console.error('Error in findOne:', error);
      throw new InternalServerErrorException(error.response);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      // Find the product by ID
      const product = await this.productRepository.findOneBy({ id });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      // Check if the category_id in the DTO is different from the current category
      if (updateProductDto?.category_id !== product.category?.id) {
        if (updateProductDto?.category_id !== '') {
          const newCategory = await this.categoryService.findOneById(
            updateProductDto.category_id,
          );
          if (newCategory) {
            product.category = newCategory;
          }
        } else {
          // If the category_id is empty in the DTO, empty the category relationship
          product.category = null;
        }
      }

      this.productRepository.merge(product, updateProductDto);
      const updatedProduct = await this.productRepository.save(product);

      return updatedProduct;
    } catch (error) {
      console.error('===> updateProduct error', error);

      if (error.code === 'ER_NO_DEFAULT_FOR_FIELD') {
        throw new InternalServerErrorException(error.sqlMessage);
      }
      throw new InternalServerErrorException(error.sqlMessage);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }

  async softDeleteProduct(id: string): Promise<void> {
    try {
      const product = await this.productRepository.findOneBy({ id });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      product.deletedAt = new Date(); // Set the deletedAt property

      await this.productRepository.save(product);
    } catch (error) {
      console.error('Error in softDeleteProduct:', error);

      if (error instanceof NotFoundException) {
        throw error; // Re-throw NotFoundException as-is
      } else {
        throw new InternalServerErrorException('Failed to soft delete product');
      }
    }
  }

  async undeleteProduct(id: string): Promise<Product | undefined> {
    try {
      const product = await this.productRepository.findOne({
        where: { id: id },
        withDeleted: true,
      });

      if (product) {
        product.deletedAt = null;
        return await this.productRepository.save(product);
      }
      throw new HttpException('Product Not found', HttpStatus.NOT_FOUND);
    } catch (error) {
      console.log("Error in undeleteProduct:", error);

      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException("Something went wrong", HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }

  async uploadImages(productId: string, images: any[]) {
    if (!Array.isArray(images) || images.length === 0) {
      throw new HttpException('No images to upload', HttpStatus.BAD_REQUEST);
    }

    try {
      const product = await this.productRepository.findOne({
        where: { id: productId },
        relations: ['images'],
      });

      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }

      for (const image of images) {
        if (!image.mimetype.startsWith('image/')) {
          throw new HttpException(
            'Invalid file format',
            HttpStatus.BAD_REQUEST,
          );
        }

        const originalString = `${process.env.SERVER_URL}product-image/${image.path}`;
        const stringWithoutSpaces = originalString.replace(/\s/g, '');

        const productImage = new ProductImage();
        productImage.filename = stringWithoutSpaces;
        productImage.product = product;

        product.images.push(productImage);

        await this.productImageRepository.save(productImage);
      }

      await this.productRepository.save(product);

      return { message: 'Image uploaded successfully!' };
    } catch (error) {
      console.error('Error uploading images:', error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          'Error uploading images',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
