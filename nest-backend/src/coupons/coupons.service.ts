import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { Product } from '../products/entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(data: any) {
    if (await this.couponRepository.findOne({ where: { code: data.code } })) {
      throw new BadRequestException('Coupon code already exists');
    }
    const couponRaw = this.couponRepository.create(data);
    if (Array.isArray(couponRaw)) {
      throw new BadRequestException('Bulk creation not supported');
    }
    const coupon = couponRaw as Coupon;
    if (data.applicableProducts) {
      coupon.applicableProducts = (await this.productRepository.findBy({ id: In(data.applicableProducts) })) as Product[];
    }
    if (data.applicableCategories) {
      coupon.applicableCategories = (await this.categoryRepository.findBy({ id: In(data.applicableCategories) })) as Category[];
    }
    if (data.createdBy) {
      const user = await this.userRepository.findOne({ where: { id: data.createdBy } });
      if (user) {
        coupon.createdBy = user;
      }
    }
    return this.couponRepository.save(coupon);
  }

  async update(id: string, data: any) {
    const coupon = await this.couponRepository.findOne({ where: { id }, relations: ['applicableProducts', 'applicableCategories'] });
    if (!coupon) throw new NotFoundException('Coupon not found');
    Object.assign(coupon, data);
    if (data.applicableProducts) {
      coupon.applicableProducts = await this.productRepository.findBy({ id: In(data.applicableProducts) });
    }
    if (data.applicableCategories) {
      coupon.applicableCategories = await this.categoryRepository.findBy({ id: In(data.applicableCategories) });
    }
    return this.couponRepository.save(coupon);
  }

  async delete(id: string) {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    await this.couponRepository.remove(coupon);
    return { message: 'Coupon deleted' };
  }

  async findAll() {
    return this.couponRepository.find({ relations: ['applicableProducts', 'applicableCategories', 'createdBy'] });
  }

  async findOne(id: string) {
    const coupon = await this.couponRepository.findOne({ where: { id }, relations: ['applicableProducts', 'applicableCategories', 'createdBy'] });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async assignProducts(id: string, productIds: string[]) {
    const coupon = await this.couponRepository.findOne({ where: { id }, relations: ['applicableProducts'] });
    if (!coupon) throw new NotFoundException('Coupon not found');
    coupon.applicableProducts = await this.productRepository.findBy({ id: In(productIds) });
    return this.couponRepository.save(coupon);
  }

  async assignCategories(id: string, categoryIds: string[]) {
    const coupon = await this.couponRepository.findOne({ where: { id }, relations: ['applicableCategories'] });
    if (!coupon) throw new NotFoundException('Coupon not found');
    coupon.applicableCategories = await this.categoryRepository.findBy({ id: In(categoryIds) });
    return this.couponRepository.save(coupon);
  }
} 