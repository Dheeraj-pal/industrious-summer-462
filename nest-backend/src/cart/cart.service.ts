import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { Coupon, CouponDiscountType } from '../coupons/entities/coupon.entity';
import { DeliveryChargeRuleService } from '../orders/delivery-charge-rule.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    private readonly deliveryChargeRuleService: DeliveryChargeRuleService,
  ) { }

  private async recalculateCartTotals(cart: Cart): Promise<void> {
    if (!cart.items || cart.items.length === 0) {
      cart.subtotal = 0;
      cart.totalTax = 0;
      cart.totalSavings = 0;
      cart.totalMRP = 0;
      cart.totalAmount = 0;
      cart.deliveryCharge = 0;
      return;
    }

    let totalMRP = 0;
    let subtotal = 0;
    let totalTax = 0;
    let totalSavings = 0;

    // Calculate for each item
    for (const item of cart.items) {
      // Get latest product data
      const latestProduct = await this.productsService.findOne(item.product.id);
      item.price = latestProduct.price;
      item.mrp = latestProduct.mrp || latestProduct.price;
      // Calculate item totals
      const itemMRP = item.mrp * item.quantity;
      const itemSubtotal = item.price * item.quantity;
      const itemSavings = itemMRP - itemSubtotal;

      // Calculate GST (on base amount, not on MRP)
      const gstRate = latestProduct.gstRate || latestProduct.category.gstRate || 0;
      item.gstRate = gstRate;
      item.taxAmount = +(itemSubtotal * gstRate / 100).toFixed(2);

      // Update item subtotal
      item.subtotal = itemSubtotal;
      item.savings = itemSavings;

      // Accumulate totals
      totalMRP += itemMRP;
      subtotal += itemSubtotal;
      totalTax += item.taxAmount;
      totalSavings += itemSavings;
    }

    // Apply coupon discount (before tax calculation)
    let couponDiscount = 0;
    if (cart.couponDiscount && cart.couponDiscount > 0) {
      couponDiscount = Math.min(cart.couponDiscount, subtotal);
      subtotal = Math.max(0, subtotal - couponDiscount);
    }

    // Calculate delivery charge
    let deliveryCharge = 0;
    if (cart.user && cart.user.addresses && cart.user.addresses.length > 0) {
      const address = cart.user.addresses[0];
      const rule = await this.deliveryChargeRuleService.getApplicableRule(address, subtotal);
      deliveryCharge = rule ? rule.charge : 0;
    }

    // Update cart totals
    cart.subtotal = +subtotal.toFixed(2);
    cart.totalTax = +totalTax.toFixed(2);
    cart.totalSavings = +totalSavings.toFixed(2);
    cart.totalMRP = +totalMRP.toFixed(2);
    cart.deliveryCharge = +deliveryCharge.toFixed(2);
    cart.totalAmount = +(subtotal + totalTax + deliveryCharge).toFixed(2);
  }

  async getOrCreateCart(userId: string): Promise<Cart & {
    gstDetails: any[];
    cartBreakdown: {
      subtotal: number;
      totalTax: number;
      totalSavings: number;
      totalMRP: number;
      couponDiscount: number;
      deliveryCharge: number;
      totalAmount: number;
    };
  }> {
    let cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      select: {
        id: true,
        totalAmount: true,
        subtotal: true,
        totalTax: true,
        totalSavings: true,
        totalMRP: true,
        couponCode: true,
        couponDiscount: true,
        appliedCouponId: true,
        deliveryCharge: true,
        items: {
          id: true,
          quantity: true,
          price: true,
          subtotal: true,
          mrp: true,
          savings: true,
          taxAmount: true,
          gstRate: true,
          product: {
            id: true,
            name: true,
            description: true,
            price: true,
            mrp: true,
            stock: true,
            brand: true,
            isActive: true,
            gstRate: true,
            images: true,
            category: {
              id: true,
              name: true,
              isActive: true,
              gstRate: true,
              image: true
            }
          }
        }
      },
      relations: ['items', 'items.product', 'items.product.category'],
    });

    if (!cart) {
      const user = await this.usersService.findOne(userId);
      cart = this.cartRepository.create({ user });
      cart = await this.cartRepository.save(cart);
    } else {
      // Recalculate cart totals with latest prices and data
      await this.recalculateCartTotals(cart);
      await this.cartRepository.save(cart);
    }

    // Generate GST details for each item
    const gstDetails = cart.items.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      baseAmount: item.subtotal,
      gstRate: item.gstRate,
      gstAmount: item.taxAmount,
      totalAmount: item.subtotal + item.taxAmount,
    }));

    // Generate cart breakdown
    const cartBreakdown = {
      subtotal: cart.subtotal,
      totalTax: cart.totalTax,
      totalSavings: cart.totalSavings,
      totalMRP: cart.totalMRP,
      couponDiscount: cart.couponDiscount,
      deliveryCharge: cart.deliveryCharge,
      totalAmount: cart.totalAmount,
    };

    return { ...cart, gstDetails, cartBreakdown };
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    const product = await this.productsService.findOne(addToCartDto.productId);

    if (product.stock < addToCartDto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    let cartItem = cart.items.find(item => item.product.id === addToCartDto.productId);

    if (cartItem) {
      cartItem.quantity += addToCartDto.quantity;
      // Always update price to latest
      cartItem.price = product.price;
      cartItem.mrp = product.mrp || product.price;
    } else {
      cartItem = this.cartItemRepository.create({
        cart,
        product,
        quantity: addToCartDto.quantity,
        price: product.price,
        mrp: product.mrp || product.price,
      });
      cart.items.push(cartItem);
    }

    await this.recalculateCartTotals(cart);
    return this.cartRepository.save(cart);
  }

  async updateCartItem(
    userId: string,
    cartItemId: string,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    const cartItem = cart.items.find(item => item.id === cartItemId);

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (cartItem.product.stock < updateCartItemDto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    cartItem.quantity = updateCartItemDto.quantity;
    await this.recalculateCartTotals(cart);
    return this.cartRepository.save(cart);
  }

  async removeFromCart(userId: string, cartItemId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    const cartItemIndex = cart.items.findIndex(item => item.id === cartItemId);

    if (cartItemIndex === -1) {
      throw new NotFoundException('Cart item not found');
    }

    cart.items.splice(cartItemIndex, 1);
    await this.recalculateCartTotals(cart);
    return this.cartRepository.save(cart);
  }

  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    cart.items = [];
    await this.recalculateCartTotals(cart);
    return this.cartRepository.save(cart);
  }

  async applyCoupon(userId: string, couponCode: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    if (cart.couponCode) {
      throw new BadRequestException('A coupon is already applied. Remove it before applying a new one.');
    }
    const coupon = await this.couponRepository.findOne({ where: { code: couponCode, isActive: true } });
    if (!coupon) throw new BadRequestException('Invalid or inactive coupon');
    const now = new Date();
    if ((coupon.startDate && now < coupon.startDate) || (coupon.endDate && now > coupon.endDate)) {
      throw new BadRequestException('Coupon not valid at this time');
    }
    if (coupon.minOrderAmount && cart.totalAmount < coupon.minOrderAmount) {
      throw new BadRequestException('Cart total does not meet minimum order amount for this coupon');
    }
    // TODO: Add user usage limit, first order, user group, product/category applicability, stacking, etc.
    let discount = 0;
    if (coupon.discountType === CouponDiscountType.PERCENTAGE) {
      discount = cart.totalAmount * (coupon.discountValue / 100);
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else if (coupon.discountType === CouponDiscountType.FIXED) {
      discount = coupon.discountValue;
    } else if (coupon.discountType === CouponDiscountType.FREE_SHIPPING) {
      // For now, treat as fixed discount (should be handled in delivery logic)
      discount = 0;
    }
    discount = Math.min(discount, cart.totalAmount);
    cart.couponCode = coupon.code;
    cart.couponDiscount = +discount.toFixed(2);
    cart.appliedCouponId = coupon.id;
    await this.recalculateCartTotals(cart);
    return this.cartRepository.save(cart);
  }

  async removeCoupon(userId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    cart.couponCode = '';
    cart.couponDiscount = 0;
    cart.appliedCouponId = '';
    await this.recalculateCartTotals(cart);
    return this.cartRepository.save(cart);
  }
} 