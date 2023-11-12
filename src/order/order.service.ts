import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) { }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      return await this.orderRepository.save(createOrderDto);
    } catch (error) {
      console.error('Error creating order', error);

      // Handle specific error cases
      if (error.code === 'ER_NO_DEFAULT_FOR_FIELD') {
        // Handle the specific error when there is no default value for a field
        throw new HttpException('Error creating order: No default value for a field.', HttpStatus.BAD_REQUEST);
      }

      // If it's not a specific error, rethrow it as a generic InternalServerErrorException
      throw new InternalServerErrorException('Failed to create order');
    }
  }

  async findAll() {
    try {
      const orders = await this.orderRepository.find({
        relations: ['created_by_user', 'customer', 'order_items'],
      });

      return orders;
    } catch (error) {
      console.error('Error in findAll:', error);

      if (error instanceof HttpException) {
        throw error; // Re-throw HttpExceptions as-is
      } else {
        throw new InternalServerErrorException('Failed to retrieve orders');
      }
    }
  }

  async findOneById(id: string) {
    try {
      const order = await this.orderRepository.findOne({
        where: { id: id },
        relations: ['created_by_user', 'customer', 'order_items.product'],
      });

      if (!order) {
        throw new NotFoundException(`Order with id ${id} not found`);
      }

      return order;
    } catch (error) {
      console.error('Error in findOneById:', error);

      if (error instanceof HttpException) {
        throw error; // Re-throw HttpExceptions as-is
      } else {
        throw new InternalServerErrorException('Failed to fetch order');
      }
    }
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    try {
      const order = await this.orderRepository.findOneBy({ id });

      if (!order) {
        throw new NotFoundException(`Order with id ${id} not found`);
      }

      // Apply updates from updateOrderDto to the order entity
      this.orderRepository.merge(order, updateOrderDto);

      // Save the updated order
      await this.orderRepository.save(order);

      return order;
    } catch (error) {
      console.error('Error in update:', error);

      if (error instanceof HttpException) {
        throw error; // Re-throw HttpExceptions as-is
      } else {
        throw new InternalServerErrorException('Failed to update order');
      }
    }
  }

  async remove(id: string): Promise<number> {
    try {
      const order = await this.orderRepository.findOneBy({ id });

      if (!order) {
        throw new NotFoundException(`Order item #${id} not found`);
      }

      await this.orderRepository.remove(order);
      return HttpStatus.OK;
    } catch (error) {
      console.error('Error removing order item', error);
      throw new InternalServerErrorException('Failed to remove order item');
    }
  }
}
