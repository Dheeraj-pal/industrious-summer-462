import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfigModule } from './config/config.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AddressModule } from './addresses/address.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { SearchModule } from './search/search.module';
import { CouponsModule } from './coupons/coupons.module';
import { HomeSectionModule } from './home-section/home-section.module';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('app.database');
        const isDev = configService.get('app.nodeEnv') === 'development';
        return {
          type: 'postgres',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: String(dbConfig.password),
          database: dbConfig.database,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: isDev,
          autoLoadEntities: true,
        };
      },
      inject: [ConfigService],
    }),
    AdminModule,
    AuthModule,
    UsersModule,
    AddressModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    CartModule,
    SearchModule,
    CouponsModule,
    HomeSectionModule,
  ],
})
export class AppModule {}
