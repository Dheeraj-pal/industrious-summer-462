import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {}

  async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      const user = await this.usersService.findOne(userId);
      cart = this.cartRepository.create({ user });
      cart = await this.cartRepository.save(cart);
    }

    return cart;
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
      cartItem.subtotal = cartItem.price * cartItem.quantity;
    } else {
      cartItem = this.cartItemRepository.create({
        cart,
        product,
        quantity: addToCartDto.quantity,
        price: product.price,
        subtotal: product.price * addToCartDto.quantity,
      });
      cart.items.push(cartItem);
    }

    cart.totalAmount = cart.items.reduce((total, item) => total + item.subtotal, 0);
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
    cartItem.subtotal = cartItem.price * cartItem.quantity;

    cart.totalAmount = cart.items.reduce((total, item) => total + item.subtotal, 0);
    return this.cartRepository.save(cart);
  }

  async removeFromCart(userId: string, cartItemId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    const cartItemIndex = cart.items.findIndex(item => item.id === cartItemId);

    if (cartItemIndex === -1) {
      throw new NotFoundException('Cart item not found');
    }

    cart.items.splice(cartItemIndex, 1);
    cart.totalAmount = cart.items.reduce((total, item) => total + item.subtotal, 0);
    return this.cartRepository.save(cart);
  }

  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    cart.items = [];
    cart.totalAmount = 0;
    return this.cartRepository.save(cart);
  }
} 