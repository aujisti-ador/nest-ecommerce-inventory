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
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class OrderItemService {
  constructor(
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @Inject(OrderService)
    private readonly orderService: OrderService,
    @Inject(ProductsService)
    private readonly productsService: ProductsService
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
      const updateStock = product.stock - quantity;

      await this.orderService.update(order_id, {
        total_price: newTotal,
        total_unit: newUnit,
      });

      await this.productsService.update(product.id, {
        'stock': updateStock
      })

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
      const orderItems = await this.orderItemRepository.find({
        relations: ['product']
      });
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
      const product = await this.productsService.findOneById(orderItem.product_id);

      if (!product) {
        throw new NotFoundException(`Product item #${id} not found`);
      }

      const newTotal = orderDetails.total_price - orderItem.total_item_price;
      const newUnit = orderDetails.total_unit - orderItem.quantity;
      const updateStock = product.stock + orderItem.quantity;

      // Use Promise.all to parallelize database updates
      await Promise.all([
        this.orderService.update(orderItem.order_id, { total_price: newTotal, total_unit: newUnit }),
        this.productsService.update(product.id, { stock: updateStock }),
      ]);

      // Remove the order item
      await this.orderItemRepository.remove(orderItem);

      return HttpStatus.OK;
    } catch (error) {
      // Rethrow NotFoundException directly
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        // Log the error for further analysis
        console.error('Error removing order item:', error);
        // Re-throw the exception for handling at a higher level if needed
        throw new InternalServerErrorException('Failed to remove order item');
      }
    }
  }

}
