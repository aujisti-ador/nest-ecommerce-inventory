import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User | undefined> {
    const userExists = await this.findByEmail(createUserDto.email)
    if (userExists) {
      throw new ConflictException('User already exists');
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    createUserDto.password = hashedPassword;
    const user = await this.usersRepository.save(createUserDto);
    delete user.password;
    
    return user;
    // return await this.usersRepository.save(createUserDto);
  }

  async findAll(): Promise<User[] | undefined> {
    return await this.usersRepository.find();
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.usersRepository.findOneBy({ email })
  }

  async findOne(id: string): Promise<User | undefined> {
    return await this.usersRepository.findOneBy({ id })
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: string): Promise<void> {
    const existingUser = await this.findOne(id);
    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.usersRepository.remove(existingUser);
  }

  // private hidePassword(user: User): User {
  //   const { password, ...userWithoutPassword } = user;
  //   return userWithoutPassword;
  // }
}
