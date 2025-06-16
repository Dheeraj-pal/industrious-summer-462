import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    private productsService: ProductsService,
    private usersService: UsersService,
  ) {}

  async create(userId: string, cartItems: any[]): Promise<Order> {
    const user = await this.usersService.findOne(userId);
    const order = this.ordersRepository.create({ user });
    
    const orderItems = await Promise.all(
      cartItems.map(async (item) => {
        const product = await this.productsService.findOne(item.product.id);
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }
        
        const orderItem = this.orderItemsRepository.create({
          order,
          product,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
        });
        
        product.stock -= item.quantity;
        await this.productsService.update(product.id, { stock: product.stock });
        
        return orderItem;
      }),
    );

    order.items = orderItems;
    order.totalAmount = orderItems.reduce((total, item) => total + item.subtotal, 0);
    
    return this.ordersRepository.save(order);
  }

  async findAll(userId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
    });
  }

  async findOne(id: string, userId: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['items', 'items.product'],
    });
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    
    return order;
  }

  async update(id: string, userId: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id, userId);
    
    if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot update a delivered or cancelled order');
    }

    Object.assign(order, updateOrderDto);
    return this.ordersRepository.save(order);
  }

  async cancel(id: string, userId: string): Promise<Order> {
    const order = await this.findOne(id, userId);
    
    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot cancel a delivered order');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    // Restore product stock
    await Promise.all(
      order.items.map(async (item) => {
        const product = await this.productsService.findOne(item.product.id);
        product.stock += item.quantity;
        await this.productsService.update(product.id, { stock: product.stock });
      }),
    );

    order.status = OrderStatus.CANCELLED;
    return this.ordersRepository.save(order);
  }
} 