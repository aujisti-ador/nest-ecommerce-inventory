import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categotyRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      return await this.categotyRepository.save(createCategoryDto);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new HttpException(
          'This category has already been created!',
          HttpStatus.AMBIGUOUS,
        );
      }
    }
  }

  async findAll() {
    return this.categotyRepository.find({ relations: ['products'] });
  }

  async findOneById(id: string) {
    try {
      const category = await this.categotyRepository.findOne({
        where: { id: id },
        relations: ['products'],
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
      return category;
    } catch (error) {
      console.error('Error in findOne:', error);
      throw new InternalServerErrorException(error.response);
    }
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      const category = await this.categotyRepository.findOneBy({ id });
      if (!category) {
        throw new NotFoundException('Category not found');
      }

      category.name = updateCategoryDto.name;

      await this.categotyRepository.save(category);

      return category;
    } catch (error) {
      console.error('Error in update:', error);

      if (error.code === 'ER_NO_DEFAULT_FOR_FIELD') {
        throw new InternalServerErrorException(error.sqlMessage);
      } else if (error.code === 'ER_DUP_ENTRY') {
        throw new HttpException(
          'This category has already been created!',
          HttpStatus.AMBIGUOUS,
        );
      }

      throw new InternalServerErrorException(error.response);
    }
  }

  async remove(id: string) {
    try {
      const category = await this.categotyRepository.findOneBy({ id });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      await this.categotyRepository.remove(category);
      return HttpStatus.OK;
    } catch (error) {
      console.error('Error in remove:', error);

      throw new InternalServerErrorException(error.sqlMessage);
    }
  }
}
