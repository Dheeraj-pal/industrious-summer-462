import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { CategoriesModule } from '../categories/categories.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { HomeSectionModule } from 'src/home-section/home-section.module';
import { HomeSection } from 'src/home-section/entities/home-section.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category, HomeSection]),
    CategoriesModule,
    CloudinaryModule,
    HomeSectionModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {} 