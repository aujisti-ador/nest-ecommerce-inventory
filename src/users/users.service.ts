import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User | undefined> {
    const [emailExists, phoneExists, usernameExists] = await Promise.all([
      this.findByEmail(createUserDto.email),
      this.findByPhone(createUserDto.phone),
      this.findByUsername(createUserDto.username),
    ]);

    if (emailExists || phoneExists || usernameExists) {
      throw new ConflictException(
        'User already exists with email, username, or phone',
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    createUserDto.password = hashedPassword;

    const user = await this.usersRepository.save(createUserDto);
    delete user.password;

    return user;
  }

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersRepository.update(userId, {
      currentHashedRefreshToken,
    });
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    const user = await this.findOneById(userId);

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );

    if (!isRefreshTokenMatching) {
      throw new HttpException('Wrong refresh token', HttpStatus.BAD_REQUEST);
    }
    return user;
  }

  async removeRefreshToken(userId: string) {
    return this.usersRepository.update(userId, {
      currentHashedRefreshToken: '',
    });
  }

  async findAll(): Promise<User[] | undefined> {
    return await this.usersRepository.find();
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.usersRepository.findOneBy({ email });
  }
  async findByPhone(phone: string): Promise<User | undefined> {
    return await this.usersRepository.findOneBy({ phone });
  }
  async findByUsername(username: string): Promise<User | undefined> {
    return await this.usersRepository.findOneBy({ username });
  }

  async findOneById(id: string): Promise<User | undefined> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: id },
        relations: ['order'],
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User | undefined> {
    const user = await this.findOneById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    // Save the updated user
    const updatedUser = await this.usersRepository.save({
      ...user,
      ...updateUserDto,
    });

    // Optional: You can also exclude sensitive data from the response, like the password
    delete updatedUser.password;
    delete updatedUser.currentHashedRefreshToken;

    return updatedUser;
  }

  async uploadAvatar(id: string, avatarUrl: string): Promise<void> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      await this.deleteAvatar(id);
      await this.usersRepository.update(id, { avatar: avatarUrl });
    } catch (error) {
      throw new Error('Failed to update avatar');
    }
  }

  async deleteAvatar(id: string): Promise<void> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.avatar) {
      throw new NotFoundException('Avatar not found');
    }

    try {
      const avatarsFolderPath = path.join('avatars');
      const avatarFileName = path.basename(user.avatar);
      const filePath = path.join(avatarsFolderPath, avatarFileName);

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
          throw new HttpException(
            'Failed to delete avatar',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        } else {
          console.log('File deleted successfully');
        }
      });

      // Update the user's avatar URL in the database
      await this.usersRepository.update(id, { avatar: '' });
    } catch (error) {
      console.error('Error deleting avatar:', error);
      throw new HttpException(
        'Failed to delete avatar',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string): Promise<void> {
    const existingUser = await this.findOneById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.usersRepository.remove(existingUser);
  }
}
