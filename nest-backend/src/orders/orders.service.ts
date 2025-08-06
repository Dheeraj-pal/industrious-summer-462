import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UUIDUtil } from '../common/utils/uuid.util';
import { Cart } from '../cart/entities/cart.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    private productsService: ProductsService,
    private usersService: UsersService,
  ) {}

  async create(userId: string, cartItems: any[]): Promise<Order | void> {
    const user = await this.usersService.findOne(userId);    
    if (
      !user.addresses.length ||
      user.addresses.filter((address) => address.isDefault === true).length !==
        1
    ) {
      throw new BadRequestException('Select an address');
    }
    const order = this.ordersRepository.create({ user });

    // Fetch the user's cart to get coupon info
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
    });
    if (cart) {
      order.couponCode = cart.couponCode;
      order.couponDiscount = cart.couponDiscount;
      order.couponType = cart.couponCode ? 'applied' : '';
    }

    // let orderTotal = 0;
    // const orderItems = await Promise.all(
    //   cartItems.map(async (item) => {
    //     const product = await this.productsService.findOne(item.product.id);
    //     if (product.stock < item.quantity) {
    //       throw new Error(`Insufficient stock for product ${product.name}`);
    //     }
    //     // Fetch GST rate from product
    //     const gstRate = product.gstRate || 0;
    //     const baseSubtotal = item.price * item.quantity;
    //     const gstAmount = +(baseSubtotal * gstRate / 100).toFixed(2);
    //     const subtotal = +(baseSubtotal + gstAmount).toFixed(2);
    //     orderTotal += subtotal;
    //     const orderItem = this.orderItemsRepository.create({
    //       order,
    //       product,
    //       quantity: item.quantity,
    //       price: item.price,
    //       subtotal,
    //       gstRate,
    //       gstAmount,
    //     });
    //     product.stock -= item.quantity;
    //     await this.productsService.update(product.id, { stock: product.stock });
    //     return orderItem;
    //   }),
    // );

    // order.items = orderItems;
    // order.totalAmount = orderTotal;

    // return this.ordersRepository.save(order);
  }

  async findAll(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{ items: Order[]; total: number }> {
    const [items, total] = await this.ordersRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['user', 'items', 'items.product'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { items, total };
  }

  async findOne(id: string): Promise<Order & { gstDetails: any[] }> {
    // Validate UUID format first
    UUIDUtil.validateUUID(id, 'Order ID');

    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['user', 'items', 'items.product'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Add GST details for each item
    const gstDetails = order.items.map((item) => ({
      productId: item.product.id,
      gstRate: item.gstRate,
      gstAmount: item.gstAmount,
      subtotal: item.subtotal,
    }));

    return { ...order, gstDetails };
  }

  async update(
    id: string,
    userId: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    // Validate UUID format first
    UUIDUtil.validateUUID(id, 'Order ID');
    UUIDUtil.validateUUID(userId, 'User ID');

    const order = await this.findOne(id);

    if (
      order.status === OrderStatus.DELIVERED ||
      order.status === OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Cannot update a delivered or cancelled order',
      );
    }

    Object.assign(order, updateOrderDto);
    return this.ordersRepository.save(order);
  }

  async cancel(id: string, userId: string): Promise<Order> {
    // Validate UUID format first
    UUIDUtil.validateUUID(id, 'Order ID');
    UUIDUtil.validateUUID(userId, 'User ID');

    const order = await this.findOne(id);

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

  async count(): Promise<number> {
    return this.ordersRepository.count();
  }

  async findRecent(limit: number): Promise<Order[]> {
    return this.ordersRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['user', 'items'],
    });
  }

  async updateStatus(id: string, status: string): Promise<Order> {
    // Validate UUID format first
    UUIDUtil.validateUUID(id, 'Order ID');

    const order = await this.findOne(id);
    order.status = status as OrderStatus;
    return this.ordersRepository.save(order);
  }
}
