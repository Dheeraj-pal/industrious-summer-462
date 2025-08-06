import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { CategoriesService } from '../categories/categories.service';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class AdminService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly categoriesService: CategoriesService,
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
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
    console.log('createProductDto > admin service > 53 ===> ', JSON.stringify(createProductDto))
    const result = await this.productsService.create(createProductDto);
    if (Array.isArray(result)) {
      throw new Error('Bulk creation not supported');
    }
    return result;
  }

  async updateProduct(id: string, updateProductDto: any) {
    return this.productsService.update(id, updateProductDto);
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