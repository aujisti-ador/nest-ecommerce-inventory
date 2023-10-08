import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  NotFoundException,
  ForbiddenException,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpException,
  HttpStatus,
  UploadedFile,
  Post,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import JwtAuthenticationGuard from 'src/auth/jwt-authentication.guard';
import RoleGuard from 'src/roles/roles.guard';
import { Role } from 'src/enums/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as moment from 'moment';
import * as fs from 'fs';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthenticationGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  // @UseGuards(RoleGuard(Role.ADMIN))
  // @UseGuards(JwtAuthenticationGuard)
  @UseGuards(RoleGuard(Role.ADMIN))
  @UseInterceptors(ClassSerializerInterceptor)
  findOneById(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @Patch(':id')
  @UseGuards(RoleGuard(Role.ADMIN))
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      const updatedUser = await this.usersService.update(id, updateUserDto);
      return updatedUser;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw new HttpException('Permission denied', HttpStatus.FORBIDDEN);
      } else {
        // Handle other errors as needed
        throw new HttpException(
          'Failed to update user',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  @Get('avatars/:fileId')
  async serveAvatar(@Param('fileId') fileId, @Res() res): Promise<any> {
    try {
      const filePath = `avatars/${fileId}`;
      if (!fs.existsSync(filePath)) {
        throw new NotFoundException('Avatar not found');
      }
      res.sendFile(fileId, { root: 'avatars' });
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(error.getStatus()).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  @Post(':userid/avatar')
  @UseGuards(JwtAuthenticationGuard)
  @UseInterceptors(
    FileInterceptor('file', {
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
          return cb(
            null,
            `${originalNameWithoutExtension}-${timestamp}-${randomName}${extname(
              file.originalname,
            )}`,
          );
        },
      }),
    }),
  )
  async uploadAvatar(@Param('userid') userId, @UploadedFile() file) {
    try {
      await this.usersService.setAvatar(
        userId,
        `${process.env.SERVER_URL}users/${file.path}`,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('User not found');
      } else {
        throw new Error('Something went wrong');
      }
    }
  }

  // @Delete(':id/avatar')
  // async deleteAvatar(@Param('id') id: string): Promise<void> {
  //   try {
  //     await this.usersService.deleteAvatar(id);
  //   } catch (error) {
  //     if (error instanceof NotFoundException) {
  //       throw new NotFoundException(error.message);
  //     } else {
  //       throw new Error('Failed to delete avatar'); // Handle other errors as needed
  //     }
  //   }
  // }

  @Delete(':id')
  @UseGuards(RoleGuard(Role.ADMIN))
  async remove(@Param('id') id: string) {
    try {
      const user = await this.usersService.findOneById(id);
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Perform the user removal logic here
      await this.usersService.remove(id);

      return { message: 'User deleted successfully' };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        // Handle ForbiddenException (RoleGuard denied access)
        throw new ForbiddenException(
          'You do not have permission to delete this user',
        );
      } else {
        // Handle other exceptions (e.g., NotFoundException)
        throw error;
      }
    }
  }
}
