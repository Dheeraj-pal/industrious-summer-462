import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { DeliveryChargeRule } from './entities/delivery-charge-rule.entity';
import { DeliveryChargeRuleService } from './delivery-charge-rule.service';
import { DeliveryChargeRuleController } from './delivery-charge-rule.controller';
import { CartModule } from '../cart/cart.module';
import { Cart } from 'src/cart/entities/cart.entity';
import { PaymentsModule } from '../payments/payments.module';
import { AddressModule } from '../addresses/address.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      DeliveryChargeRule,
      Cart,
    ]),
    ProductsModule,
    UsersModule,
    forwardRef(() => CartModule),
    PaymentsModule,
    AddressModule,
  ],
  controllers: [OrdersController, DeliveryChargeRuleController],
  providers: [OrdersService, DeliveryChargeRuleService],
  exports: [OrdersService, DeliveryChargeRuleService],
})
export class OrdersModule {}