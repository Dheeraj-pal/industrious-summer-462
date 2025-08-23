import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Send order confirmation email
   * @param params Order confirmation email parameters
   */
  async sendOrderConfirmation(params: {
    email: string;
    orderNumber: string;
    orderItems: Array<{ name: string; quantity: number; price: number }>;
    totalAmount: number;
    shippingAddress: {
      name: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      pincode: string;
    };
  }): Promise<boolean> {
    try {
      // In a real application, you would integrate with an email service like SendGrid, Mailgun, etc.
      // For now, we'll just log the email details
      this.logger.log(`Sending order confirmation email to ${params.email}`);
      this.logger.log(`Order Number: ${params.orderNumber}`);
      this.logger.log(`Total Amount: ${params.totalAmount}`);
      
      // In production, replace this with actual email sending logic
      // Example with SendGrid:
      // await this.sendgrid.send({
      //   to: params.email,
      //   from: this.configService.get('EMAIL_FROM'),
      //   subject: `Order Confirmation #${params.orderNumber}`,
      //   html: this.generateOrderConfirmationTemplate(params),
      // });
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to send order confirmation email: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Generate HTML template for order confirmation email
   * @param params Order confirmation parameters
   * @returns HTML template string
   */
  private generateOrderConfirmationTemplate(params: any): string {
    // In a real application, you would use a template engine or HTML template
    // For simplicity, we're just returning a basic HTML string
    return `
      <h1>Order Confirmation</h1>
      <p>Thank you for your order!</p>
      <p>Order Number: ${params.orderNumber}</p>
      <h2>Order Details</h2>
      <ul>
        ${params.orderItems.map(item => `
          <li>${item.name} x ${item.quantity} - ₹${item.price.toFixed(2)}</li>
        `).join('')}
      </ul>
      <p>Total Amount: ₹${params.totalAmount.toFixed(2)}</p>
      <h2>Shipping Address</h2>
      <p>
        ${params.shippingAddress.name}<br>
        ${params.shippingAddress.addressLine1}<br>
        ${params.shippingAddress.addressLine2 ? params.shippingAddress.addressLine2 + '<br>' : ''}
        ${params.shippingAddress.city}, ${params.shippingAddress.state} ${params.shippingAddress.pincode}
      </p>
    `;
  }
}