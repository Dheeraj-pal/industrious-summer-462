import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  Order,
  OrderStatus,
  PaymentStatus,
} from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private configService: ConfigService,
    private dataSource: DataSource,
    private emailService: EmailService,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    const stripeKey: any = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      this.logger.warn(
        'STRIPE_SECRET_KEY is not defined in environment variables, using a mock key for development',
      );
      const mockKey = this.configService.get<string>('STRIPE_SECRET_KEY');
      if (!mockKey) {
        throw new Error(
          'STRIPE_MOCK_KEY is not defined in environment variables',
        );
      }
      this.stripe = new Stripe(mockKey, {
        apiVersion: '2025-06-30.basil',
      });
    } else {
      this.stripe = new Stripe(stripeKey, {
        apiVersion: '2025-06-30.basil',
      });
    }
  }

  async createPaymentSession(params: {
    lineItems: Array<{
      price_data: {
        currency: string;
        product_data: {
          name: string;
          images?: string[];
          description?: string;
        };
        unit_amount: number;
      };
      quantity: number;
    }>;
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
    metadata?: Record<string, string>;
  }) {
    try {
      // Get or create a Stripe customer
      let customerId: string | undefined;

      if (params.metadata?.userId && params.customerEmail) {
        customerId = await this.getOrCreateCustomer(
          params.metadata.userId,
          params.customerEmail,
        );
      }

      // Create a Stripe Checkout session
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ['card'],
        line_items: params.lineItems,
        mode: 'payment',
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: params.metadata,
      };

      // Add customer if available
      if (customerId) {
        sessionParams.customer = customerId;
      } else if (params.customerEmail) {
        sessionParams.customer_email = params.customerEmail;
      }

      const session = await this.stripe.checkout.sessions.create(sessionParams);

      // If we have an order ID in metadata, update the order with the session ID
      if (params.metadata?.orderId) {
        await this.updateOrderWithSessionId(
          params.metadata.orderId,
          session.id,
        );
      }

      return { url: session.url, id: session.id };
    } catch (error) {
      this.logger.error(
        `Error creating payment session: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to create payment session: ${error.message}`,
      );
    }
  }

  private async getOrCreateCustomer(
    userId: string,
    email: string,
  ): Promise<string> {
    try {
      // First, check if the user already has a Stripe customer ID
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });

      if (user && user.stripeCustomerId) {
        // Verify the customer still exists in Stripe
        try {
          await this.stripe.customers.retrieve(user.stripeCustomerId);
          return user.stripeCustomerId;
        } catch (error) {
          this.logger.warn(
            `Stripe customer ${user.stripeCustomerId} not found, creating new one`,
          );
          // Customer doesn't exist in Stripe, create a new one
        }
      }

      // Create a new customer in Stripe
      const customer = await this.stripe.customers.create({
        email,
        metadata: { userId },
      });

      // Update user with Stripe customer ID if user exists
      if (user) {
        user.stripeCustomerId = customer.id;
        await this.usersRepository.save(user);
      }

      return customer.id;
    } catch (error) {
      this.logger.error(
        `Error getting/creating Stripe customer: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to process customer information: ${error.message}`,
      );
    }
  }

  private async updateOrderWithSessionId(
    orderId: string,
    sessionId: string,
  ): Promise<void> {
    try {
      await this.ordersRepository.update(orderId, {
        stripeSessionId: sessionId,
      });
    } catch (error) {
      this.logger.error(
        `Error updating order with session ID: ${error.message}`,
        error.stack,
      );
      // Don't throw here, as we don't want to fail the payment session creation
    }
  }

  async handleWebhook(event: any, signature: string, rawBody: any) {
    let stripeEvent: Stripe.Event;

    try {
      // Get the webhook secret from environment variables
      const webhookSecret = this.configService.get<string>(
        'STRIPE_WEBHOOK_SECRET',
      );

      if (!webhookSecret) {
        this.logger.warn(
          'STRIPE_WEBHOOK_SECRET is not defined, skipping signature verification',
        );
        stripeEvent = event;
      } else {
        // Verify the event with the Stripe signature
        stripeEvent = this.stripe.webhooks.constructEvent(
          rawBody,
          signature,
          webhookSecret,
        );
      }

      this.logger.log(`Received verified webhook event: ${stripeEvent.type}`);

      // Process the event based on its type
      switch (stripeEvent.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(
            stripeEvent.data.object as Stripe.PaymentIntent,
          );
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(
            stripeEvent.data.object as Stripe.PaymentIntent,
          );
          break;
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(
            stripeEvent.data.object as Stripe.Checkout.Session,
          );
          break;
        default:
          this.logger.log(`Unhandled event type: ${stripeEvent.type}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error(
        `Error handling webhook: ${error.message}`,
        error.stack,
      );
      // We still return success to Stripe to prevent retries, but we'll throw the error
      // so the controller can return a proper error response
      throw error;
    }
  }

  private async handlePaymentIntentSucceeded(
    paymentIntent: Stripe.PaymentIntent,
  ) {
    this.logger.log(`Payment succeeded for intent: ${paymentIntent.id}`);

    // Get the order ID from metadata
    const orderId = paymentIntent.metadata?.orderId;
    if (!orderId) {
      this.logger.error('No order ID found in payment intent metadata');
      return;
    }

    // Update order status in a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get the order
      const order = await queryRunner.manager.findOne(Order, {
        where: { id: orderId },
        relations: ['user', 'items', 'items.product', 'shippingAddress'],
      });

      if (!order) {
        throw new Error(`Order with ID ${orderId} not found`);
      }

      // Update order status
      order.paymentStatus = PaymentStatus.COMPLETED;
      order.status = OrderStatus.PROCESSING;
      order.paymentIntentId = paymentIntent.id;

      await queryRunner.manager.save(order);

      // Send confirmation email
      await this.sendOrderConfirmationEmail(order);

      await queryRunner.commitTransaction();
      this.logger.log(`Order ${orderId} marked as paid successfully`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error updating order after payment: ${error.message}`,
        error.stack,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Send order confirmation email
   * @param order The order to send confirmation for
   */
  private async sendOrderConfirmationEmail(order: Order): Promise<void> {
    try {
      if (!order.user || !order.user.email) {
        this.logger.warn(
          `Cannot send confirmation email for order ${order.id}: User email not found`,
        );
        return;
      }

      // Format order items for email
      const orderItems = order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
      }));

      // Send the email
      await this.emailService.sendOrderConfirmation({
        email: order.user.email,
        orderNumber: order.orderNumber,
        orderItems,
        totalAmount: order.totalAmount,
        shippingAddress: {
          name: order.shippingAddress.name,
          addressLine1: order.shippingAddress.addressLine1,
          addressLine2: order.shippingAddress.addressLine2,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          pincode: order.shippingAddress.pincode,
        },
      });

      this.logger.log(`Order confirmation email sent for order ${order.id}`);
    } catch (error) {
      // Log but don't throw - we don't want to fail the payment process if email fails
      this.logger.error(
        `Failed to send order confirmation email: ${error.message}`,
        error.stack,
      );
    }
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    this.logger.log(`Payment failed for intent: ${paymentIntent.id}`);

    const orderId = paymentIntent.metadata?.orderId;
    if (!orderId) {
      this.logger.error('No order ID found in payment intent metadata');
      return;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id: orderId },
      });

      if (!order) {
        throw new Error(`Order with ID ${orderId} not found`);
      }

      order.paymentStatus = PaymentStatus.FAILED;
      order.status = OrderStatus.PAYMENT_FAILED;

      await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();
      this.logger.log(`Order ${orderId} marked as payment failed`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error updating order after payment failure: ${error.message}`,
        error.stack,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ) {
    this.logger.log(`Checkout session completed: ${session.id}`);

    // If the session has a payment intent, process it
    if (session.payment_intent) {
      const paymentIntentId =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent.id;

      const paymentIntent =
        await this.stripe.paymentIntents.retrieve(paymentIntentId);
      await this.handlePaymentIntentSucceeded(paymentIntent);
    }
  }

  async verifyPayment(sessionId: string) {
    try {
      // Retrieve the session from Stripe
      const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['payment_intent'],
      });

      // Check if the payment was successful
      if (session.payment_status === 'paid') {
        // Get the order ID from the session metadata
        const orderId = session.metadata?.orderId;
        const userId = session.metadata?.userId;

        // Get payment intent ID
        const paymentIntentId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id;

        return {
          success: true,
          paymentStatus: session.payment_status,
          metadata: session.metadata,
          customerEmail: session.customer_details?.email,
          amountPaid: (session.amount_total ?? 0) / 100, // Convert from cents to actual currency
          paymentIntentId,
        };
      } else {
        return {
          success: false,
          paymentStatus: session.payment_status,
          metadata: session.metadata,
        };
      }
    } catch (error) {
      this.logger.error(
        `Error verifying payment: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Error verifying payment: ${error.message}`,
      );
    }
  }
}
