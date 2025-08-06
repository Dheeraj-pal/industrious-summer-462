import { Controller, Post, Patch, Delete, Get, Param, Body, UseGuards, Query, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateCouponDto } from './dto/create-coupon.dto'
import { User } from 'src/users/entities/user.entity';

@ApiTags('coupons')
@Controller('coupons')
@ApiBearerAuth()
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) { }

  @Post()
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Create a new coupon' })
  @ApiBody({ type: CreateCouponDto })
  @ApiResponse({ status: 201, description: 'Coupon created' })
  async create(@Body() data: CreateCouponDto) {
    const coupon = await this.couponsService.create(data);
    return { message: 'Coupon created', data: coupon };
  }

  @Patch(':id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Update a coupon' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: CreateCouponDto })
  @ApiResponse({ status: 200, description: 'Coupon updated' })
  async update(@Param('id') id: string, @Body() data: CreateCouponDto) {
    const coupon = await this.couponsService.update(id, data);
    return { message: 'Coupon updated', data: coupon };
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Delete a coupon' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Coupon deleted' })
  async delete(@Param('id') id: string) {
    const result = await this.couponsService.delete(id);
    return { message: 'Coupon deleted', data: result };
  }

  @Get()
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get all coupons (admin)' })
  @ApiResponse({ status: 200, description: 'List of all coupons' })
  async findAll() {
    const coupons = await this.couponsService.findAll();
    return coupons;
  }

  @Get('available')
  @ApiOperation({ summary: 'Get all available coupons for customers' })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of available coupons for the customer' })
  async getAvailableCoupons(@Request() req) {
    // You can enhance this logic to filter by user, order, etc.
    const coupons = await this.couponsService.findAll();
    const now = new Date();
    const available = coupons.filter(c => c.isActive && (!c.startDate || now >= new Date(c.startDate)) && (!c.endDate || now <= new Date(c.endDate)));
    return available ;
  }

  @Get(':id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get coupon by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Coupon details' })
  async findOne(@Param('id') id: string) {
    const coupon = await this.couponsService.findOne(id);
    return { message: 'Coupon details', data: coupon };
  }

  @Post(':id/products')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Assign products to coupon' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ schema: { type: 'object', properties: { productIds: { type: 'array', items: { type: 'string' } } } } })
  @ApiResponse({ status: 200, description: 'Products assigned to coupon' })
  async assignProducts(@Param('id') id: string, @Body('productIds') productIds: string[]) {
    const result = await this.couponsService.assignProducts(id, productIds);
    return { message: 'Products assigned to coupon', data: result };
  }

  @Post(':id/categories')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Assign categories to coupon' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ schema: { type: 'object', properties: { categoryIds: { type: 'array', items: { type: 'string' } } } } })
  @ApiResponse({ status: 200, description: 'Categories assigned to coupon' })
  async assignCategories(@Param('id') id: string, @Body('categoryIds') categoryIds: string[]) {
    const result = await this.couponsService.assignCategories(id, categoryIds);
    return { message: 'Categories assigned to coupon', data: result };
  }
} 