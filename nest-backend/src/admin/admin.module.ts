import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ProductsModule } from '../products/products.module';
import { CategoriesModule } from '../categories/categories.module';
import { OrdersModule } from '../orders/orders.module';
import { UsersModule } from '../users/users.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { HomeSectionModule } from '../home-section/home-section.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeSection } from '../home-section/entities/home-section.entity';

@Module({
  imports: [
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    UsersModule,
    CloudinaryModule,
    HomeSectionModule,
    TypeOrmModule.forFeature([HomeSection])
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}