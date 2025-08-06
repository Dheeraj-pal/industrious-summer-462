import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeSectionService } from './home-section.service';
import { HomeSectionController } from './home-section.controller';
import { HomeSection } from './entities/home-section.entity';
import { Product } from '../products/entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HomeSection, Product, Category]), 
    AuthModule,
    CloudinaryModule
  ],
  controllers: [HomeSectionController],
  providers: [HomeSectionService],
  exports: [HomeSectionService],
})
export class HomeSectionModule {}
