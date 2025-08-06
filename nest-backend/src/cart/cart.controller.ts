import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('cart')
@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @Roles('customer', 'admin')
  @ApiOperation({ summary: 'Get current user cart' })
  @ApiResponse({ status: 200, description: 'Return the cart.' })
  getCart(@Request() req) {
    return this.cartService.getOrCreateCart(req.user.id);
  }

  @Post('items')
  @Roles('customer', 'admin')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 201, description: 'Item added to cart successfully.' })
  addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(req.user.id, addToCartDto);
  }

  @Patch('items/:id')
  @Roles('customer', 'admin')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({ status: 200, description: 'Cart item updated successfully.' })
  updateCartItem(
    @Request() req,
    @Param('id') cartItemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(req.user.id, cartItemId, updateCartItemDto);
  }

  @Delete('items/:id')
  @Roles('customer', 'admin')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Item removed from cart successfully.' })
  removeFromCart(@Request() req, @Param('id') cartItemId: string) {
    return this.cartService.removeFromCart(req.user.id, cartItemId);
  }

  @Delete()
  @Roles('customer', 'admin')
  @ApiOperation({ summary: 'Clear cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully.' })
  clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.id);
  }

  @Post('apply-coupon')
  @Roles('customer', 'admin')
  @ApiOperation({ summary: 'Apply coupon to cart' })
  @ApiResponse({ status: 200, description: 'Coupon applied successfully.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        couponCode: { type: 'string', description: 'Category name' }
      },
    },
  })
  applyCoupon(@Request() req, @Body('couponCode') couponCode: string) {
    return this.cartService.applyCoupon(req.user.id, couponCode);
  }

  @Post('remove-coupon')
  @Roles('customer', 'admin')
  @ApiOperation({ summary: 'Remove coupon from cart' })
  @ApiResponse({ status: 200, description: 'Coupon removed successfully.' })
  removeCoupon(@Request() req) {
    return this.cartService.removeCoupon(req.user.id);
  }
}