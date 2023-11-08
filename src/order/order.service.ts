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
import { CreateOrderItemDto } from 'src/order-item/dto/create-order-item.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  create(createOrderDto: CreateOrderDto) {
    console.log('===> Order created', createOrderDto);
    return this.orderRepository.save(createOrderDto);
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

  remove(id: string) {
    try {
      const order = this.orderRepository.findOneBy({ id });
      if (!order) {
        throw new NotFoundException(`Order item #${id} not found`);
      }
      return HttpStatus.OK;
    } catch (error) {
      throw new InternalServerErrorException('Failed to remove order item');
    }
  }
}
