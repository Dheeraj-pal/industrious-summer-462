import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Order,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UUIDUtil } from '../common/utils/uuid.util';
import { Cart } from '../cart/entities/cart.entity';
import { PaymentsService } from '../payments/payments.service';
import { AddressService } from '../addresses/address.service';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  OrderResponseDto,
  OrderItemResponseDto,
  AddressResponseDto,
} from './dto/order-response.dto';
import { CartItem } from '../cart/entities/cart-item.entity';

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
    private paymentsService: PaymentsService,
    private addressService: AddressService,
  ) {}

  async create(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    // Use a transaction for ACID compliance
    const queryRunner =
      this.ordersRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.usersService.findOne(userId);

      // Get shipping address
      const shippingAddress = await this.addressService.findOne(
        user.id,
        createOrderDto.shippingAddressId,
      );
      if (!shippingAddress) {
        throw new BadRequestException('Invalid shipping address');
      }

      // Create new order
      const order = this.ordersRepository.create({
        user,
        orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        shippingAddress,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: createOrderDto.paymentMethod || PaymentMethod.CARD,
        deliveryOption: createOrderDto.deliveryOption,
        notes: createOrderDto.notes,
      });

      // Fetch the user's cart
      const cart = await queryRunner.manager.findOne(Cart, {
        where: { user: { id: userId } },
        relations: ['items', 'items.product'],
      });

      if (!cart || !cart.items || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      // Apply coupon if provided
      if (createOrderDto.couponCode) {
        order.couponCode = createOrderDto.couponCode;
        order.couponDiscount = cart.couponDiscount || 0;
        order.couponType = 'applied';
      } else if (cart.couponCode) {
        // Use coupon from cart if available
        order.couponCode = cart.couponCode;
        order.couponDiscount = cart.couponDiscount;
        order.couponType = 'applied';
      }

      // Calculate order totals
      let subtotal = 0;
      let totalTax = 0;

      // Create order items from cart items
      const orderItems = await Promise.all(
        cart.items.map(async (item) => {
          const product = await this.productsService.findOne(item.product.id);

          if (product.stock < item.quantity) {
            throw new BadRequestException(
              `Insufficient stock for product ${product.name}`,
            );
          }

          // Calculate item totals
          const gstRate = product.gstRate || 0;
          const itemPrice = item.price;
          const itemSubtotal = +(itemPrice * item.quantity).toFixed(2);
          const gstAmount = +((itemSubtotal * gstRate) / 100).toFixed(2);

          subtotal += itemSubtotal;
          totalTax += gstAmount;

          // Create order item without circular reference
          const orderItem = this.orderItemsRepository.create({
            product,
            quantity: item.quantity,
            price: itemPrice,
            subtotal: itemSubtotal,
            gstRate,
            gstAmount,
          });
          console.log('1');
          // Update product stock
          product.stock -= item.quantity;
          console.log('2');
          await this.productsService.update(product.id, {
            stock: product.stock,
          });
          console.log('3');
          return orderItem;
        }),
      );
      console.log('4');
      // Set order items and totals
      order.items = orderItems;
      order.subtotal = subtotal;
      order.totalTax = totalTax;
      order.deliveryCharge = cart.deliveryCharge || 0;
      // Ensure all values are numbers for calculation
      const discount = order.couponDiscount || 0;
      order.totalAmount = +(
        subtotal +
        totalTax +
        order.deliveryCharge -
        discount
      ).toFixed(2);
      console.log('5');
      // Set estimated delivery date (7 days from now for standard, 3 days for express)
      const deliveryDays = order.deliveryOption === 'express' ? 3 : 7;
      const estimatedDeliveryDate = new Date();
      estimatedDeliveryDate.setDate(
        estimatedDeliveryDate.getDate() + deliveryDays,
      );
      order.estimatedDeliveryDate = estimatedDeliveryDate;
      console.log('6');
      // Save the order
      console.log('order', JSON.stringify(order, null, 2));
      // Ensure all required fields are set
      if (!order.user) console.log('Missing user in order');
      if (!order.shippingAddress)
        console.log('Missing shippingAddress in order');
      if (!order.items || order.items.length === 0)
        console.log('Missing items in order');
      if (order.totalAmount === undefined)
        console.log('Missing totalAmount in order');

      let savedOrder;

      // First save the order without items
      const { items, ...orderWithoutItems } = order;
      savedOrder = await queryRunner.manager.save(Order, orderWithoutItems);
      console.log('7');

      // Then save each order item with the saved order reference
      if (items && items.length > 0) {
        for (const item of items) {
          item.order = savedOrder;
          await queryRunner.manager.save(OrderItem, item);
        }
        // Reload the order with items
        savedOrder = await queryRunner.manager.findOne(Order, {
          where: { id: savedOrder.id },
          relations: ['items', 'items.product', 'shippingAddress', 'user'],
        });
      }

      // Clear the cart after successful order creation
      if (cart.items && cart.items.length > 0) {
        console.log('8');
        // Delete all cart items for this cart
        await queryRunner.manager.delete(CartItem, { cart: { id: cart.id } });
        console.log('9');
      }

      // Commit the transaction
      await queryRunner.commitTransaction();
      console.log('10');

      // Return formatted order response
      return this.formatOrderResponse(savedOrder);
    } catch (error) {
      // Rollback the transaction in case of error
      await queryRunner.rollbackTransaction();
      console.error('Error creating order:', error.message);
      console.error('Error details:', error);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{
    items: any[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  }> {
    // Execute query with pagination
    const [orders, total] = await this.ordersRepository.findAndCount({
      relations: ['user', 'items', 'items.product', 'shippingAddress'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    // Format response
    const items = orders.map((order) => this.formatOrderResponse(order));
    return {
      items,
      pagination: {
        total: total,
        page: page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId?: string): Promise<OrderResponseDto> {
    // Validate UUID format first
    UUIDUtil.validateUUID(id, 'Order ID');

    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['user', 'items', 'items.product', 'shippingAddress'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // If userId is provided, verify that the order belongs to the user
    if (userId && order.user.id !== userId) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.formatOrderResponse(order);
  }

  async update(
    id: string,
    userId: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<OrderResponseDto> {
    // Validate UUID format first
    UUIDUtil.validateUUID(id, 'Order ID');
    UUIDUtil.validateUUID(userId, 'User ID');

    const order = await this.findOne(id, userId);
    const orderEntity = await this.ordersRepository.findOne({
      where: { id },
      relations: ['user', 'items', 'items.product', 'shippingAddress'],
    });

    if (!orderEntity) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (
      orderEntity.status === OrderStatus.DELIVERED ||
      orderEntity.status === OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Cannot update a delivered or cancelled order',
      );
    }

    // Handle shipping address update if provided
    if (updateOrderDto.shippingAddressId) {
      const shippingAddress = await this.addressService.findOne(
        userId,
        updateOrderDto.shippingAddressId,
      );
      if (!shippingAddress) {
        throw new BadRequestException('Invalid shipping address');
      }
      orderEntity.shippingAddress = shippingAddress;
      delete updateOrderDto.shippingAddressId;
    }

    // Update order properties
    Object.assign(orderEntity, updateOrderDto);
    const updatedOrder = await this.ordersRepository.save(orderEntity);
    return this.formatOrderResponse(updatedOrder);
  }

  async cancel(id: string, userId: string): Promise<OrderResponseDto> {
    // Validate UUID format first
    UUIDUtil.validateUUID(id, 'Order ID');
    UUIDUtil.validateUUID(userId, 'User ID');

    const orderEntity = await this.ordersRepository.findOne({
      where: { id },
      relations: ['user', 'items', 'items.product', 'shippingAddress'],
    });

    if (!orderEntity) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (orderEntity.user.id !== userId) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (orderEntity.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot cancel a delivered order');
    }

    if (orderEntity.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    // Restore product stock
    await Promise.all(
      orderEntity.items.map(async (item) => {
        const product = await this.productsService.findOne(item.product.id);
        product.stock += item.quantity;
        await this.productsService.update(product.id, { stock: product.stock });
      }),
    );

    // Update order status
    orderEntity.status = OrderStatus.CANCELLED;
    orderEntity.paymentStatus = PaymentStatus.REFUNDED;

    const updatedOrder = await this.ordersRepository.save(orderEntity);
    return this.formatOrderResponse(updatedOrder);
  }

  async count(): Promise<number> {
    return this.ordersRepository.count();
  }

  async findRecent(userId: string, limit: number): Promise<OrderResponseDto[]> {
    const orders = await this.ordersRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['user', 'items', 'items.product', 'shippingAddress'],
    });

    return orders.map((order) => this.formatOrderResponse(order));
  }

  async updateStatus(id: string, status: string): Promise<OrderResponseDto> {
    // Validate UUID format first
    UUIDUtil.validateUUID(id, 'Order ID');

    const orderEntity = await this.ordersRepository.findOne({
      where: { id },
      relations: ['user', 'items', 'items.product', 'shippingAddress'],
    });

    if (!orderEntity) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    orderEntity.status = status as OrderStatus;
    const updatedOrder = await this.ordersRepository.save(orderEntity);
    return this.formatOrderResponse(updatedOrder);
  }

  async createPaymentSession(
    orderId: string,
    userId: string,
    options: { successUrl?: string; cancelUrl?: string } = {},
  ): Promise<{ url: string; sessionId: string }> {
    // Validate UUID format
    UUIDUtil.validateUUID(orderId, 'Order ID');
    UUIDUtil.validateUUID(userId, 'User ID');

    // Get order with items and products
    const order = await this.ordersRepository.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: ['user', 'items', 'items.product', 'shippingAddress'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException(
        'Cannot process payment for a cancelled order',
      );
    }

    if (order.paymentStatus === PaymentStatus.COMPLETED) {
      throw new BadRequestException(
        'Payment has already been completed for this order',
      );
    }

    // Format line items for Stripe
    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: item.product.name,
          images:
            item.product.images && item.product.images.length > 0
              ? [item.product.images[0].secure_url]
              : [],
          description: item.product.description?.substring(0, 100) || '',
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents/paise
      },
      quantity: item.quantity,
    }));

    // Add tax, delivery charge, and discount as separate line items if needed
    if (order.totalTax > 0) {
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: {
            name: 'Tax',
            description: 'GST and other applicable taxes',
            images: [],
          },
          unit_amount: Math.round(order.totalTax * 100),
        },
        quantity: 1,
      });
    }

    if (order.deliveryCharge > 0) {
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: {
            name: 'Delivery Charge',
            description: `${order.deliveryOption === 'express' ? 'Express' : 'Standard'} Delivery`,
            images: [],
          },
          unit_amount: Math.round(order.deliveryCharge * 100),
        },
        quantity: 1,
      });
    }

    if (order.couponDiscount > 0) {
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: {
            name: 'Discount',
            description: `Coupon: ${order.couponCode}`,
            images: [],
          },
          unit_amount: -Math.round(order.couponDiscount * 100), // Negative amount for discount
        },
        quantity: 1,
      });
    }

    // Create Stripe session
    const session = await this.paymentsService.createPaymentSession({
      lineItems,
      successUrl:
        options.successUrl ||
        `${process.env.FRONTEND_URL}/orders/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl:
        options.cancelUrl ||
        `${process.env.FRONTEND_URL}/orders/cancel?session_id={CHECKOUT_SESSION_ID}`,
      customerEmail: order.user.email,
      metadata: {
        orderId: order.id,
        userId: userId,
      },
    });

    // Update order with session ID
    order.stripeSessionId = session.id;
    order.status = OrderStatus.PAYMENT_PENDING;
    await this.ordersRepository.save(order);

    return {
      url: session.url || '',
      sessionId: session.id,
    };
  }

  async verifyPayment(
    sessionId: string,
    userId: string,
  ): Promise<OrderResponseDto> {
    if (!sessionId) {
      throw new BadRequestException('Session ID is required');
    }

    // Verify payment with Stripe
    const paymentResult = await this.paymentsService.verifyPayment(sessionId);

    if (!paymentResult.success) {
      throw new BadRequestException('Payment verification failed');
    }

    // Get order ID from metadata
    const orderId = paymentResult.metadata?.orderId;
    if (!orderId) {
      throw new BadRequestException(
        'Order information not found in payment session',
      );
    }

    // Get and update order
    const order = await this.ordersRepository.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: ['user', 'items', 'items.product', 'shippingAddress'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Update order payment status
    order.paymentStatus = PaymentStatus.COMPLETED;
    order.status = OrderStatus.PROCESSING;
    order.paymentIntentId = paymentResult.paymentIntentId || '';

    const updatedOrder = await this.ordersRepository.save(order);
    return this.formatOrderResponse(updatedOrder);
  }

  /**
   * Format an order entity into a response DTO
   * @param order The order entity to format
   * @returns Formatted OrderResponseDto
   */
  private formatOrderResponse(order: Order): OrderResponseDto {
    // Format order items
    const items = order.items.map((item) => {
      const itemResponse = new OrderItemResponseDto();
      itemResponse.id = item.id;
      itemResponse.productId = item.product.id;
      itemResponse.productName = item.product.name;
      itemResponse.productImage =
        item.product.images && item.product.images.length > 0
          ? item.product.images[0].secure_url
          : '';
      itemResponse.price = item.price;
      itemResponse.quantity = item.quantity;
      itemResponse.subtotal = item.price * item.quantity;
      return itemResponse;
    });

    // Format shipping address
    const address = new AddressResponseDto();
    if (order.shippingAddress) {
      address.id = order.shippingAddress.id;
      address.name = order.shippingAddress.name;
      address.addressLine1 = order.shippingAddress.addressLine1;
      address.addressLine2 = order.shippingAddress.addressLine2;
      address.city = order.shippingAddress.city;
      address.state = order.shippingAddress.state;
      address.pincode = order.shippingAddress.pincode;
      address.country = order.shippingAddress.country;
      address.phone = order.shippingAddress.phone;
    }

    // Create and populate the response DTO
    const response = new OrderResponseDto();
    response.id = order.id;
    response.orderNumber = order.orderNumber;
    response.userId = order.user.id;
    response.status = order.status;
    response.items = items;
    response.subtotal = order.subtotal;
    response.totalTax = order.totalTax;
    response.deliveryCharge = order.deliveryCharge;
    response.totalAmount = order.totalAmount;
    response.couponCode = order.couponCode;
    response.couponDiscount = order.couponDiscount;
    response.shippingAddress = address;
    response.paymentMethod = order.paymentMethod;
    response.paymentStatus = order.paymentStatus;
    response.deliveryOption = order.deliveryOption;
    response.estimatedDeliveryDate = order.estimatedDeliveryDate;
    response.trackingNumber = order.trackingNumber;
    response.notes = order.notes;
    response.createdAt = order.createdAt;
    response.updatedAt = order.updatedAt;

    return response;
  }
}
