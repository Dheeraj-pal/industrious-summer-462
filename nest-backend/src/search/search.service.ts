import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async searchProducts(
    query: string,
    categoryId?: string,
    page = 1,
    limit = 10,
  ): Promise<{
    items: any[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  }> {
    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where(
        '(LOWER(product.name) LIKE LOWER(:query) OR LOWER(product.description) LIKE LOWER(:query) OR LOWER(product.brand) LIKE LOWER(:query))',
        { query: `%${query}%` },
      ).select([
        'product.id',
        'product.name',
        'product.isActive',
        'product.isDealOfTheWeek',
        'product.isSponsored',
        'category.id',
        'category.name',
        'category.isActive',
      ]);

    if (categoryId) {
      qb.andWhere('category.id = :categoryId', { categoryId });
    }

    const [productsWithPrices, total] = await qb.getManyAndCount();
    
    return {
      items: productsWithPrices,
      pagination: {
        total: total,
        page: page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
