import { Controller, Post, Get, Body, Req, Query, UseGuards, Headers, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery, ApiOperation, ApiBody } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-session')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a payment session with Stripe' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        lineItems: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              price_data: {
                type: 'object',
                properties: {
                  currency: { type: 'string' },
                  product_data: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      images: { type: 'array', items: { type: 'string' } },
                      description: { type: 'string' }
                    }
                  },
                  unit_amount: { type: 'number' }
                }
              },
              quantity: { type: 'number' }
            }
          }
        },
        successUrl: { type: 'string' },
        cancelUrl: { type: 'string' },
        customerEmail: { type: 'string' },
        metadata: { type: 'object' }
      }
    }
  })
  async createSession(@Body() paymentData: any) {
    if (!paymentData.lineItems || !Array.isArray(paymentData.lineItems) || paymentData.lineItems.length === 0) {
      throw new BadRequestException('Line items are required and must be a non-empty array');
    }
    
    if (!paymentData.successUrl) {
      throw new BadRequestException('Success URL is required');
    }
    
    if (!paymentData.cancelUrl) {
      throw new BadRequestException('Cancel URL is required');
    }
    
    return this.paymentsService.createPaymentSession(paymentData);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  async handleWebhook(@Body() event: any, @Headers('stripe-signature') signature: string, @Req() req) {
    if (!signature) {
      throw new BadRequestException('Stripe signature is missing');
    }
    
    try {
      // Pass both the raw body, signature, and request body to the service
      return await this.paymentsService.handleWebhook(event, signature, req.rawBody);
    } catch (error) {
      throw new BadRequestException(`Webhook error: ${error.message}`);
    }
  }
  
  @Get('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify a payment session with Stripe' })
  @ApiQuery({ name: 'session_id', required: true, description: 'Stripe checkout session ID' })
  async verifyPayment(@Query('session_id') sessionId: string, @Req() req) {
    if (!sessionId) {
      throw new BadRequestException('Session ID is required');
    }
    
    const result = await this.paymentsService.verifyPayment(sessionId);
    
    // Return the verification result
    return {
      success: result.success,
      paymentStatus: result.paymentStatus,
      metadata: result.metadata,
      amountPaid: result.amountPaid
    };
  }
}