import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CategoriesService } from '../categories/categories.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UUIDUtil } from '../common/utils/uuid.util';
import { Gender } from './enums/gender.enum';
import { HomeSection, HomeSectionType } from 'src/home-section/entities/home-section.entity';
import { HomeSectionService } from 'src/home-section/home-section.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private categoriesService: CategoriesService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async count(): Promise<number> {
    return this.productsRepository.count();
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const category = await this.categoriesService.findOne(
      createProductDto.categoryId,
    );
    let gstRate = (createProductDto as any)['gstRate'];
    if (
      typeof gstRate !== 'number' &&
      category &&
      typeof category.gstRate === 'number'
    ) {
      gstRate = category.gstRate;
    }
    const productData: any = {
      ...createProductDto,
      category,
    };
    if (typeof gstRate === 'number') {
      productData.gstRate = gstRate;
    }
    const product = this.productsRepository.create(productData);
    const savedProduct = await this.productsRepository.save(product);
    return savedProduct[0];
  }

  async findAll(
    page = 1,
    limit = 10,
    filters?: any,
  ): Promise<{
    items: any[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  }> {
    const {
      sortBy = 'id',
      sortOrder = 'DESC',
      minPrice = 0,
      maxPrice,
      inStock,
      categoryId,
      productName,
    } = filters || {};

    const query = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    // Price filtering
    if (!isNaN(minPrice)) {
      query.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (!isNaN(maxPrice)) {
      query.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // Stock filter
    if (inStock === true || inStock === 'true') {
      query.andWhere('product.stock > 0');
    }

    // Category filter (optional)
    if (categoryId) {
      query.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    // Product name filter (optional)
    if (productName) {
      query.andWhere('product.name LIKE :productName', {
        productName: `%${productName}%`,
      });
    }

    // Sorting
    query.orderBy(
      `product.${sortBy}`,
      sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
    );

    // Pagination
    query.skip((page - 1) * limit).take(limit);

    // Fetch data and count
    const [items, total] = await query.getManyAndCount();

    // Add MRP and discountedPrice
    const productsWithPrices = items.map((product) => ({
      ...product,
      mrp: product.mrp,
      discountedPrice: product.price,
    }));

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

  async findByCategory(
    categoryId: string,
    page = 1,
    limit = 10,
    filters?: any,
  ): Promise<{
    items: any[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  }> {
    UUIDUtil.validateUUID(categoryId, 'Category ID');

    // Check if category exists
    await this.categoriesService.findOne(categoryId);

    const { sortBy, sortOrder, minPrice, maxPrice, inStock, onSale } =
      filters || {};

    const query = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('category.id = :categoryId', { categoryId })
      .andWhere('product.isActive = true')
      .andWhere('category.isActive = true');

    // Price filter
    if (minPrice !== undefined && maxPrice !== undefined) {
      query.andWhere('product.price BETWEEN :minPrice AND :maxPrice', {
        minPrice,
        maxPrice,
      });
    } else if (minPrice !== undefined) {
      query.andWhere('product.price >= :minPrice', { minPrice });
    } else if (maxPrice !== undefined) {
      query.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // In-stock filter
    if (inStock === true) {
      query.andWhere('product.stock > 0');
    }

    // On-sale filter
    if (onSale === true) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('product.isDealOfTheWeek = true').orWhere(
            'product.price < product.mrp',
          );
        }),
      );
    }

    // Sorting
    if (sortBy) {
      query.orderBy(
        `product.${sortBy}`,
        sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
      );
    } else {
      query.orderBy('product.id', 'DESC');
    }

    // Pagination
    const [items, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Add both MRP and discounted price
    const productsWithPrices = items.map((product) => ({
      ...product,
      mrp: product.mrp,
      discountedPrice: product.price,
    }));

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

  async findOne(id: string): Promise<any> {
    // Validate UUID format first
    UUIDUtil.validateUUID(id, 'Product ID');

    const product = await this.productsRepository.findOne({
      where: { id },
      select: {
        id: true,
        name: true,
        brand: true,
        description: true,
        mrp: true,
        price: true,
        stock: true,
        isActive: true,
        gstRate: true,
        images: true,
        gender: true,
        isDealOfTheWeek: true,
        isSponsored: true,
        category: {
          id: true,
          name: true,
          isActive: true,
          gstRate: true,
          image: true,
        },
      },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Add both MRP and discounted price
    return {
      ...product,
      mrp: product.mrp,
      discountedPrice: product.price,
    };
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    // Validate UUID format first
    UUIDUtil.validateUUID(id, 'Product ID');

    const product = await this.findOne(id);
    if (
      updateProductDto.images &&
      product.images &&
      product.images.length > 0
    ) {
      const publicIds = product.images.map((image) => image.public_id);
      await Promise.all(
        publicIds.map((id) => this.cloudinaryService.deleteImage(id)),
      );
    }

    if (updateProductDto.categoryId) {
      const category = await this.categoriesService.findOne(
        updateProductDto.categoryId,
      );
      product.category = category;
    }

    Object.assign(product, updateProductDto);
    return this.productsRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    // Validate UUID format first
    UUIDUtil.validateUUID(id, 'Product ID');

    const product = await this.findOne(id);
    if (product.images && product.images.length > 0) {
      const publicIds = product.images.map((image) => image.public_id);
      await Promise.all(
        publicIds.map((id) => this.cloudinaryService.deleteImage(id)),
      );
    }
    const result = await this.productsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  async quickSearch(
    q: string,
    page: number,
    limit: number,
  ): Promise<{
    items: any[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  }> {
    const query = await this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where(
        new Brackets((qb) => {
          qb.where('product.name ILIKE :query', { query: `%${q}%` })
            .orWhere('product.description ILIKE :query', { query: `%${q}%` })
            .orWhere('product.brand ILIKE :query', { query: `%${q}%` })
            .orWhere('category.name ILIKE :query', { query: `%${q}%` });
        }),
      )
      .andWhere('product.isActive = true')
      .andWhere('category.isActive = true')
      .select([
        'product.id',
        'product.name',
        'product.isActive',
        'product.isDealOfTheWeek',
        'product.isSponsored',
        'category.id',
        'category.name',
        'category.isActive',
      ]);

    // Pagination
    query.skip((page - 1) * limit).take(limit);

    // Fetch data and count
    const [items, total] = await query.getManyAndCount();

    return {
      items,
      pagination: {
        total: total,
        page: page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async search(
    q: string,
    page: number,
    limit: number,
  ): Promise<{
    items: any[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  }> {
    const query = await this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where(
        new Brackets((qb) => {
          qb.where('product.name ILIKE :query', { query: `%${q}%` })
            .orWhere('product.description ILIKE :query', { query: `%${q}%` })
            .orWhere('product.brand ILIKE :query', { query: `%${q}%` })
            .orWhere('category.name ILIKE :query', { query: `%${q}%` });
        }),
      )
      .andWhere('product.isActive = true')
      .andWhere('category.isActive = true');

    // Pagination
    query.skip((page - 1) * limit).take(limit);

    // Fetch data and count
    const [items, total] = await query.getManyAndCount();

    const productsWithPrices = items.map((product) => ({
      ...product,
      mrp: product.mrp,
      discountedPrice: product.price,
    }));

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

  async getHomeScreen(): Promise<any> {
    const bannerImages = [
      { id: 1, image: 'https://example.com/banner1.jpg' },
      { id: 2, image: 'https://example.com/banner2.jpg' },
      { id: 3, image: 'https://example.com/banner3.jpg' },
    ];

    const shopByCategory = await this.categoriesService.findAll();

    const maleProducts = await this.productsRepository.find({
      where: { gender: Gender.MALE },
      take: 10,
    });
    const femaleProducts = await this.productsRepository.find({
      where: { gender: Gender.FEMALE },
      take: 10,
    });
    const kidsProducts = await this.productsRepository.find({
      where: { gender: Gender.KIDS },
      take: 10,
    });

    const refreshYourHomeAndBeautyStorage = {
      male: maleProducts,
      female: femaleProducts,
      kids: kidsProducts,
    };

    const popularOnOurSite = await this.productsRepository.find({ take: 10 });

    const allProducts = await this.productsRepository.find();
    const featuredCoupons = allProducts
      .filter((product) => product.price > 50)
      .map((product) => ({
        id: product.id,
        name: `Coupon for ${product.name}`,
        discount: 0.1,
      }))
      .slice(0, 5);

    const gameDay = [
      { id: 1, image: 'https://example.com/game_day1.jpg' },
      { id: 2, image: 'https://example.com/game_day2.jpg' },
      { id: 3, image: 'https://example.com/game_day3.jpg' },
    ];

    const dealsOfTheWeek = await this.productsRepository.find({
      where: { isDealOfTheWeek: true },
      take: 10,
    });
    const sponsoredProducts = await this.productsRepository.find({
      where: { isSponsored: true },
      take: 10,
    });

    return {
      bannerImages,
      shopByCategory,
      refreshYourHomeAndBeautyStorage,
      popularOnOurSite,
      featuredCoupons,
      gameDay,
      dealsOfTheWeek,
      sponsoredProducts,
    };
  }
}
