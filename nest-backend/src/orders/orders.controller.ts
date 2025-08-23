import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderPaymentDto, VerifyPaymentDto } from './dto/order-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrderResponseDto } from './dto/order-response.dto';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order successfully created.', type: OrderResponseDto })
  async create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.id, createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders for the current user' })
  @ApiResponse({ status: 200, description: 'Return all orders.', type: [OrderResponseDto] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] })
  async findAll(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.ordersService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by id' })
  @ApiResponse({ status: 200, description: 'Return the order.', type: OrderResponseDto })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.ordersService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an order' })
  @ApiResponse({ status: 200, description: 'Order successfully updated.', type: OrderResponseDto })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, req.user.id, updateOrderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiResponse({ status: 200, description: 'Order successfully cancelled.', type: OrderResponseDto })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async cancel(@Request() req, @Param('id') id: string) {
    return this.ordersService.cancel(id, req.user.id);
  }

  @Post('payment/create')
  @ApiOperation({ summary: 'Create a payment session for an order' })
  @ApiResponse({ status: 200, description: 'Payment session created successfully.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async createPaymentSession(@Request() req, @Body() orderPaymentDto: OrderPaymentDto) {
    return this.ordersService.createPaymentSession(orderPaymentDto.orderId, req.user.id, {
      successUrl: orderPaymentDto.successUrl,
      cancelUrl: orderPaymentDto.cancelUrl,
    });
  }

  @Post('payment/verify')
  @ApiOperation({ summary: 'Verify a payment session' })
  @ApiResponse({ status: 200, description: 'Payment verified successfully.', type: OrderResponseDto })
  @ApiResponse({ status: 400, description: 'Payment verification failed.' })
  async verifyPayment(@Request() req, @Body() verifyPaymentDto: VerifyPaymentDto) {
    return this.ordersService.verifyPayment(verifyPaymentDto.sessionId, req.user.id);
  }

  @Get('user/recent')
  @ApiOperation({ summary: 'Get recent orders for the current user' })
  @ApiResponse({ status: 200, description: 'Return recent orders.', type: [OrderResponseDto] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findRecent(@Request() req, @Query('limit') limit?: number) {
    return this.ordersService.findRecent(req.user.id, limit || 5);
  }
}