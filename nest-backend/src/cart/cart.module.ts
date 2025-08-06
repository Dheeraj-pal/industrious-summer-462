import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { CouponsModule } from 'src/coupons/coupons.module';
import { Coupon } from 'src/coupons/entities/coupon.entity';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem, Coupon]),
    ProductsModule,
    UsersModule,
    CouponsModule,
    forwardRef(() => OrdersModule)
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {} 