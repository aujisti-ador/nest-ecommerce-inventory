import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { OrderItem } from './entities/order-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class OrderItemService {
  constructor(
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
  ) {}
  async create(createOrderItemDto: CreateOrderItemDto) {
    try {
      const orderItem = new OrderItem();

      orderItem.product = createOrderItemDto.product;
      orderItem.order_id = createOrderItemDto.order_id;
      orderItem.unit_price = createOrderItemDto.product.price;
      orderItem.quantity = createOrderItemDto.quantity;
      orderItem.discount_price = createOrderItemDto.product.discount_price;

      const unitPrice = Number(orderItem.unit_price);
      const discountPrice = Number(orderItem.discount_price);

      if (isNaN(unitPrice) || isNaN(discountPrice)) {
        throw new BadRequestException('Invalid unit price or discount price');
      }

      orderItem.total_item_price =
        Number(orderItem.quantity) *
        (discountPrice < unitPrice && discountPrice >= 0
          ? discountPrice
          : unitPrice);

      const savedOrderItem = await this.orderItemRepository.save(orderItem);

      return savedOrderItem; // Return the saved order item
    } catch (error) {
      console.error('Error creating order item', error);
      if (error instanceof HttpException) {
        throw error; // Re-throw HttpExceptions as-is
      } else {
        throw new InternalServerErrorException('Failed to create order item');
      }
    }
  }

  async findAll() {
    try {
      const orderItems = await this.orderItemRepository.find();
      return orderItems;
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve order items');
    }
  }

  async findOne(id: string) {
    try {
      const orderItem = await this.orderItemRepository.findOne({
        where: { id: id },
        relations: ['product', 'product.category'],
      });
      if (!orderItem) {
        throw new NotFoundException(`Order item #${id} not found`);
      }
      return orderItem;
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve order item');
    }
  }

  async update(id: string, updateOrderItemDto: UpdateOrderItemDto) {
    try {
      const orderItem = await this.orderItemRepository.findOneBy({ id });
      if (!orderItem) {
        throw new NotFoundException(`Order item #${id} not found`);
      }
      // Update order item fields
      this.orderItemRepository.merge(orderItem, updateOrderItemDto);
      const updatedOrderItem = await this.orderItemRepository.save(orderItem);
      return updatedOrderItem;
    } catch (error) {
      throw new InternalServerErrorException('Failed to update order item');
    }
  }

  async remove(id: string) {
    try {
      const orderItem = await this.orderItemRepository.findOneBy({ id });
      if (!orderItem) {
        throw new NotFoundException(`Order item #${id} not found`);
      }
      return HttpStatus.OK;
    } catch (error) {
      throw new InternalServerErrorException('Failed to remove order item');
    }
  }
}
