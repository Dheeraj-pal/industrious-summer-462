import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { CategoriesService } from '../categories/categories.service';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';
import { HomeSectionService } from '../home-section/home-section.service';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { Product } from 'src/products/entities/product.entity';
import { HomeSectionType } from '../home-section/entities/home-section.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HomeSection } from '../home-section/entities/home-section.entity';

@Injectable()
export class AdminService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly categoriesService: CategoriesService,
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
    private readonly homeSectionService: HomeSectionService,
    @InjectRepository(HomeSection)
    private homeSectionRepository: Repository<HomeSection>,
  ) {}

  // Dashboard Statistics
  async getDashboardStats() {
    const [
      totalProducts,
      totalCategories,
      totalOrders,
      totalUsers,
      recentOrders,
    ] = await Promise.all([
      this.productsService.count(),
      this.categoriesService.count(),
      this.ordersService.count(),
      this.usersService.count(),
      this.ordersService.findRecent(5),
    ]);

    return {
      totalProducts,
      totalCategories,
      totalOrders,
      totalUsers,
      recentOrders,
    };
  }

  // Product Management
  async getAllProducts(page = 1, limit = 10) {
    return this.productsService.findAll(page, limit);
  }

  async getProductById(id: string) {
    return this.productsService.findOne(id);
  }

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const result = await this.productsService.create(createProductDto);
    if (Array.isArray(result)) {
      throw new Error('Bulk creation not supported');
    }
    return result;
  }

  async updateProduct(id: string, updateProductDto: any) {
    // Process home section mappings based on flags
    await this.processHomeSectionMappings(id, updateProductDto);
    
    return this.productsService.update(id, updateProductDto);
  }
  
  /**
   * Process home section mappings based on product flags
   * Maps or unmaps products from home sections based on flag values
   */
  private async processHomeSectionMappings(productId: string, updateProductDto: any) {
    // Define flag to section type mapping
    const flagToSectionTypeMap = {
      isDealOfTheWeek: HomeSectionType.DEAL_LIST,
      isSponsored: HomeSectionType.SPONSORED_LIST,
      isFeaturedProduct: HomeSectionType.PRODUCT_LIST,
      isPopularOnSite: HomeSectionType.POPULAR_PRODUCTS
    };
    
    // Process each flag if it exists in the update DTO
    for (const [flag, sectionType] of Object.entries(flagToSectionTypeMap)) {
      if (updateProductDto[flag] !== undefined) {
        const flagValue = updateProductDto[flag];
        
        // Find the corresponding home section
        const homeSection = await this.homeSectionRepository.findOne({
          where: { type: sectionType },
          relations: ['products']
        });
        
        if (!homeSection) {
          // Skip if section doesn't exist
          continue;
        }
        
        // Check if product is already in the section
        const productExists = homeSection.products?.some(product => product.id === productId);
        
        if (flagValue === true && !productExists) {
          // Add product to section if flag is true and product isn't already there
          // Get the product entity directly from the repository to avoid issues with the return format
          const product = await this.productsService.findOne(productId);
          
          if (!homeSection.products) {
            homeSection.products = [];
          }
          
          // Only add the product if it exists
          if (product) {
            // The product service might return a modified object with additional properties
            // We need to ensure we're adding a proper entity object
            const productEntity = { id: productId } as Product;
            homeSection.products.push(productEntity);
            await this.homeSectionRepository.save(homeSection);
          }
        } else if (flagValue === false && productExists) {
          // Remove product from section if flag is false and product is there
          homeSection.products = homeSection.products.filter(product => product.id !== productId);
          await this.homeSectionRepository.save(homeSection);
        }
        // If flag is true and product already exists, or flag is false and product doesn't exist,
        // no action needed
      }
    }
  }

  async deleteProduct(id: string) {
    return this.productsService.remove(id);
  }

  // Category Management
  async getAllCategories() {
    return this.categoriesService.findAll();
  }

  async createCategory(createCategoryDto: any) {
    return this.categoriesService.create(createCategoryDto);
  }

  async updateCategory(id: string, updateCategoryDto: any) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  async deleteCategory(id: string) {
    return this.categoriesService.remove(id);
  }

  // Order Management
  async getAllOrders(userId: string, page = 1, limit = 10) {
    return this.ordersService.findAll(userId, page, limit);
  }

  async getOrderById(id: string) {
    return this.ordersService.findOne(id);
  }

  async updateOrderStatus(id: string, status: string) {
    return this.ordersService.updateStatus(id, status);
  }

  // User Management
  async getAllUsers(page = 1, limit = 10) {
    return this.usersService.findAll(page, limit);
  }

  async getUserById(id: string) {
    return this.usersService.findOne(id);
  }

  async updateUser(id: string, updateUserDto: any) {
    return this.usersService.update(id, updateUserDto);
  }

  async deleteUser(id: string) {
    return this.usersService.remove(id);
  }
}