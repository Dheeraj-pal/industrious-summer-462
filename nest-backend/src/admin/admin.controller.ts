import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFiles, Patch, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { CreateCategoryDto } from '../categories/dto/create-category.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService, CloudinaryUploadResult } from '../cloudinary/cloudinary.service';
import { ProductsService } from 'src/products/products.service';
import { UpdateProductDto } from 'src/products/dto/update-product.dto';
import { UpdateCategoryDto } from 'src/categories/dto/update-category.dto';
import { UserId } from '../auth/decorators/user-id.decorator';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly productsService: ProductsService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Returns dashboard statistics.' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // Product Management
  @Get('products')
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Returns all products.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllProducts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.adminService.getAllProducts(page, limit);
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Returns the product.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async getProductById(@Param('id') id: string) {
    return this.adminService.getProductById(id);
  }

  @Post('products')
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product successfully created.' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 5))
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    let images: CloudinaryUploadResult[] = [];
    if (files && files.length > 0) {
      images = await this.cloudinaryService.uploadMultipleImages(
        files,
        'products',
      );
    }
    console.log('createProductDto > admin controller > 74 ===> ', JSON.stringify(createProductDto))
    
    // Explicitly convert boolean fields to ensure correct values
    const processedDto = {
      ...createProductDto,
      images,
    };
    
    console.log('processedDto > admin controller ===> ', JSON.stringify(processedDto));
    
    return this.adminService.createProduct(processedDto);
  }

  @Patch('products/:id')
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Product name' },
        description: { type: 'string', description: 'Product description' },
        price: { type: 'string', description: 'Product price' },
        stock: { type: 'number', description: 'Product stock quantity' },
        brand: { type: 'string', description: 'Product brand' },
        categoryId: { type: 'string', description: 'Category ID' },
        isActive: { type: 'boolean', description: 'Product active status' },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Product images (max 5 files)',
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('images', 5))
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    let images: CloudinaryUploadResult[] = [];
    if (files && files.length > 0) {
      images = await this.cloudinaryService.uploadMultipleImages(
        files,
        'products',
      );
    }
    // Explicitly convert boolean fields to ensure correct values
    const processedDto = {
      ...updateProductDto,
      images,
   };
    
    console.log('processedDto > admin controller update ===> ', JSON.stringify(processedDto));
    
    return this.adminService.updateProduct(id, processedDto);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Delete product' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }

  // Category Management
  @Get('categories')
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'Returns all categories.' })
  async getAllCategories() {
    return this.adminService.getAllCategories();
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Category name' },
        description: { type: 'string', description: 'Category description' },
        isActive: { type: 'boolean', description: 'Category active status' },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Category image',
        },
        gstRate: { type: 'number', description: 'Category GST rate' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    let image;
    if (file) {
      image = await this.cloudinaryService.uploadImage(file, 'categories');
    }
    return this.adminService.createCategory({ ...createCategoryDto, image });
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({ status: 200, description: 'Category updated successfully.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Category name' },
        description: { type: 'string', description: 'Category description' },
        isActive: { type: 'boolean', description: 'Category active status' },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Category image',
        },
        gstRate: { type: 'number', description: 'Category GST rate' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    let image;
    if (file) {
      image = await this.cloudinaryService.uploadImage(file, 'categories');
    }
    return this.adminService.updateCategory(id, { ...updateCategoryDto, image });
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  async deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }

  // Order Management
  @Get('orders')
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'Returns all orders.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllOrders(
    @UserId() userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.adminService.getAllOrders(userId, page, limit);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Returns the order.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async getOrderById(@Param('id') id: string) {
    return this.adminService.getOrderById(id);
  }

  @Patch('orders/:id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  @ApiBody({ type: UpdateOrderStatusDto })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.adminService.updateOrderStatus(id, updateOrderStatusDto.status);
  }

  // User Management
  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Returns all users.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.adminService.getAllUsers(page, limit);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'Returns the user.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiBody({ type: UpdateUserDto })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.adminService.updateUser(id, updateUserDto);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }
}