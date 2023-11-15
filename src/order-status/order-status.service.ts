import { HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateOrderStatusDto } from './dto/create-order-status.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderStatus } from './entities/order-status.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OrderStatusService {
  constructor(
    @InjectRepository(OrderStatus)
    private orderStatusRepository: Repository<OrderStatus>
  ) { }
  create(createOrderStatusDto: CreateOrderStatusDto) {
    return 'This action adds a new orderStatus';
  }

  findAll() {
    try {
      const orderStatus = this.orderStatusRepository.find({
        relations: ['order']
      });
      return orderStatus;
    } catch (error) {
      console.log("Error in Order Status", error)
      if (error instanceof HttpException) {
        throw error; // Re-throw HttpExceptions as-is
      } else {
        throw new InternalServerErrorException('Failed to retrieve order status');
      }
    }
  }

  async findOne(id: string) {
    try {
      const orderStatus = await this.orderStatusRepository.findOneBy({ id })
      if (!orderStatus) {
        throw new NotFoundException(`Order Status with id ${id} not found`);
      }

      return orderStatus;
    } catch (error) {
      console.error('Error in order status:', error);

      if (error instanceof HttpException) {
        throw error; // Re-throw HttpExceptions as-is
      } else {
        throw new InternalServerErrorException('Failed to update order status');
      }
    }
  }

  async update(id: string, updateOrderStatusDto: UpdateOrderStatusDto) {
    try {
      const orderStatus = await this.orderStatusRepository.findOne({
        where: { id: id },
        relations: ['order']
      })

      if (!orderStatus) {
        throw new NotFoundException(`Order Status with id ${id} not found`);
      }

      this.orderStatusRepository.merge(orderStatus, updateOrderStatusDto);
      await this.orderStatusRepository.save(orderStatus);

      return orderStatus;
    } catch (error) {
      console.error('Error in order status:', error);

      if (error instanceof HttpException) {
        throw error; // Re-throw HttpExceptions as-is
      } else {
        throw new InternalServerErrorException('Failed to update order status');
      }
    }
  }


  async remove(id: string): Promise<number> {
    try {
      const orderStatus = await this.orderStatusRepository.findOneBy({ id })
      if (!orderStatus) {
        throw new NotFoundException(`Order Status #${id} not found`)
      }

      await this.orderStatusRepository.remove(orderStatus);
      return HttpStatus.OK;
    } catch (error) {
      console.error('Error removing order:', error);

      // Re-throw the exception for handling at a higher level if needed
      throw new InternalServerErrorException('Failed to remove order');

    }
  }
}
