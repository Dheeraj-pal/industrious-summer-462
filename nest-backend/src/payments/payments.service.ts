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
            images: item.product.images && item.product.images.length > 0 ? [item.product.images[0]] : [],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5501'}/order-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5501'}/checkout.html?canceled=true`,
      customer_email: order.user.email,
      metadata: {
        orderId: order.id,
      },
    });
    return { url: session.url, sessionId: session.id };
  }

  async handleWebhook(event: any) {
    // TODO: Handle Stripe webhook events (payment_intent.succeeded, etc.)
    // Update order status based on payment result
    return { received: true };
  }

  async verifyPayment(sessionId: string) {
    try {
      // Retrieve the session from Stripe
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      
      // Check if the payment was successful
      if (session.payment_status === 'paid') {
        // Get the order ID from the session metadata
        const orderId = session.metadata?.orderId;
        
        // TODO: Update order status in the database
        // This would typically involve updating the order status to 'PAID'
        // and possibly triggering other business logic like inventory updates
        
        return { 
          status: 'success', 
          paymentStatus: session.payment_status,
          orderId: orderId,
          customerEmail: session.customer_details?.email,
          amountPaid: (session.amount_total ?? 0) / 100 // Convert from cents to actual currency
        };
      } else {
        return { 
          status: 'pending', 
          paymentStatus: session.payment_status,
          orderId: session.metadata?.orderId
        };
      }
    } catch (error) {
      throw new BadRequestException(`Error verifying payment: ${error.message}`);
    }
  }
}