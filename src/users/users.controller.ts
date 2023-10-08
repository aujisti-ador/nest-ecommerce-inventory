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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import JwtAuthenticationGuard from 'src/auth/jwt-authentication.guard';
import RoleGuard from 'src/roles/roles.guard';
import { Role } from 'src/enums/role.enum';
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
