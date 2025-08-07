import { Controller, Post, Get, Body, Req, Query, UseGuards, Headers } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-session')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createSession(@Req() req, @Body() body: any) {
    // body should contain order/cart info or orderId
    return this.paymentsService.createPaymentSession(body.order);
  }

  @Post('webhook')
  async handleWebhook(@Body() event: any, @Headers('stripe-signature') signature: string) {
    // Stripe will POST events here
    return this.paymentsService.handleWebhook(event);
  }
  
  @Get('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'session_id', required: true })
  async verifyPayment(@Query('session_id') sessionId: string) {
    return this.paymentsService.verifyPayment(sessionId);
  }
}