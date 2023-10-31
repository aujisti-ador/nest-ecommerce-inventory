import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { Product } from 'src/products/entities/product.entity';

const MAX_IMAGES_ALLOWED = 10;

@Injectable()
export class MaxImagesInterceptor implements NestInterceptor {
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const images = request.files;
        const productId = request.params.productId;

        const product = await this.productRepository.findOne({
            where: { id: productId },
            relations: ['images'],
        });

        if (!product) {
            throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
        }

        const numberOfImagesToAdd = images.length;
        const numberOfImagesCurrentlyUploaded = product.images.length;
        const totalImagesAfterUpload = numberOfImagesCurrentlyUploaded + numberOfImagesToAdd;

        if (totalImagesAfterUpload > MAX_IMAGES_ALLOWED) {
            const numberOfImagesToRemove = totalImagesAfterUpload - MAX_IMAGES_ALLOWED;
            const deletePromises = images.map(async (image) => {
                const productFileName = image.filename;
                const filePath = 'products/' + productFileName;
                await this.deleteFile(filePath);
            });

            await Promise.all(deletePromises);

            throw new HttpException(
                `Maximum image upload limit exceeded, please remove ${numberOfImagesToRemove} images`,
                HttpStatus.PAYLOAD_TOO_LARGE,
            );
        }

        return next.handle();
    }

    private async deleteFile(filePath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                    reject(err);
                } else {
                    console.log('File deleted successfully');
                    resolve();
                }
            });
        });
    }
}
