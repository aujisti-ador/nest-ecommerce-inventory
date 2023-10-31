import { HttpException, HttpStatus } from '@nestjs/common';
import * as moment from 'moment';
import { diskStorage } from 'multer';
import { extname } from 'path';

// Multer configuration
export const multerConfig = {
    dest: "./files",
    // dest: process.env.UPLOAD_LOCATION,
};

// Multer upload options
export const multerOptions = {
    // Enable file size limits
    limits: {
        fileSize: 5000000,
        // fileSize: +process.env.MAX_FILE_SIZE,
    },
    // Check the mimetypes to allow for upload
    fileFilter: (req: any, file: any, cb: any) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
            // Allow storage of file
            cb(null, true);
        } else {
            // Reject file
            cb(new HttpException(`Unsupported file type ${extname(file.originalname)}`, HttpStatus.BAD_REQUEST), false);
        }
    },
    storage: diskStorage({
        destination: './avatars',
        filename: (req, file, cb) => {
            const timestamp = moment().format('DD-MM-YYYY-HH:mm:ss');
            const originalNameWithoutExtension = file.originalname
                .split('.')
                .slice(0, -1)
                .join('');
            const randomName = Array(32)
                .fill(null)
                .map(() => Math.round(Math.random() * 16).toString(16))
                .join('');

            const stringWithoutSpaces = `${originalNameWithoutExtension}-${timestamp}-${randomName}${extname(
                file.originalname
            )}`.replace(/\s/g, '');

            return cb(null, stringWithoutSpaces);
        },
    }),
};

export const multerOptionsProducts = {
    // Enable file size limits
    limits: {
        fileSize: 5000000,
        // fileSize: +process.env.MAX_FILE_SIZE,
    },
    // Check the mimetypes to allow for upload
    fileFilter: (req: any, file: any, cb: any) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
            // Allow storage of file
            cb(null, true);
        } else {
            // Reject file
            cb(new HttpException(`Unsupported file type ${extname(file.originalname)}`, HttpStatus.BAD_REQUEST), false);
        }
    },
    storage: diskStorage({
        destination: './products',
        filename: (req, file, cb) => {
            const timestamp = moment().format('DD-MM-YYYY-HH:mm:ss');
            const originalNameWithoutExtension = file.originalname
                .split('.')
                .slice(0, -1)
                .join('');
            const randomName = Array(32)
                .fill(null)
                .map(() => Math.round(Math.random() * 16).toString(16))
                .join('');

            const stringWithoutSpaces = `product-${originalNameWithoutExtension}-${timestamp}-${randomName}${extname(
                file.originalname
            )}`.replace(/\s/g, '');

            return cb(null, stringWithoutSpaces);
        },
    }),
};