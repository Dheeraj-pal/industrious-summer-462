import { Injectable, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe = new Stripe('sk_test_REPLACE_WITH_YOUR_KEY');

  async createPaymentSession(order: any) {
    // Create a Stripe Checkout session
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: order.items.map(item => ({
        price_data: {
          currency: 'inr',
          product_data: {
            name: item.product.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: 'https://yourdomain.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://yourdomain.com/cancel',
      customer_email: order.user.email,
    });
    return { url: session.url };
  }

  async handleWebhook(event: any) {
    // TODO: Handle Stripe webhook events (payment_intent.succeeded, etc.)
    // Update order status based on payment result
    return { received: true };
  }

  async verifyPayment(paymentId: string) {
    // TODO: Verify payment status with Stripe
    return { status: 'success' };
  }
} 