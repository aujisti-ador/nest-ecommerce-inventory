import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { OrderItem } from './entities/order-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderService } from 'src/order/order.service';

@Injectable()
export class OrderItemService {
  constructor(
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @Inject(OrderService)
    private readonly orderService: OrderService
  ) { }

  async create(createOrderItemDto: CreateOrderItemDto) {
    try {
      const { product, order_id, quantity } = createOrderItemDto;

      const orderItem = this.orderItemRepository.create({
        product,
        order_id,
        unit_price: product.price,
        quantity,
        discount_price: product.discount_price,
      });

      const { unit_price, discount_price } = orderItem;

      if (isNaN(unit_price) || isNaN(discount_price)) {
        throw new BadRequestException('Invalid unit price or discount price');
      }

      orderItem.total_item_price =
        quantity *
        (discount_price < unit_price && discount_price > 0
          ? discount_price
          : unit_price);

      const savedOrderItem = await this.orderItemRepository.save(orderItem);

      const orderDetails = await this.orderService.findOneById(order_id);

      const newTotal = orderDetails.total_price + orderItem.total_item_price;
      const newUnit = orderDetails.total_unit + quantity;

      const updatedOrder = await this.orderService.update(order_id, {
        total_price: newTotal,
        total_unit: newUnit,
      });

      console.log("===> updatedOrder", updatedOrder);
      console.log("===> orderObject", { total_price: newTotal, total_unit: newUnit });
      console.log("===> orderItem", orderItem);
      console.log("===> orderDetails", orderDetails);
      console.log("===> orderItem.total_item_price", orderItem.total_item_price)


      return savedOrderItem;
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
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          'Failed to retrieve order item',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
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

      const orderDetails = await this.orderService.findOneById(orderItem.order_id);

      const newTotal = orderDetails.total_price - orderItem.total_item_price;
      const newUnit = orderDetails.total_unit - orderItem.quantity;

      await this.orderService.update(orderItem.order_id, {
        total_price: newTotal,
        total_unit: newUnit,
      });

      await this.orderItemRepository.remove(orderItem);
      return HttpStatus.OK;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        // If it's not a specific error, rethrow it as a generic InternalServerErrorException
        throw new InternalServerErrorException('Failed to remove order');
      }
    }
  }
}
