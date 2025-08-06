import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import {
  CloudinaryService,
} from '../cloudinary/cloudinary.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Return all products' })
  @ApiQuery({ name: 'page', required: true, type: Number })
  @ApiQuery({ name: 'limit', required: true, type: Number })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: String,
    description: 'Filter products by category ID',
  })
  @ApiQuery({
    name: 'productName',
    required: false,
    type: String,
    description: 'Filter products by product name',
  })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'inStock', required: false, type: Boolean })
  @ApiQuery({ name: 'onSale', required: false, type: Boolean })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('categoryId') categoryId?: string,
    @Query('productName') productName?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('minPrice') minPrice: string = '0',
    @Query('maxPrice') maxPrice?: string,
    @Query('inStock') inStock?: string,
    @Query('onSale') onSale?: string,
  ) {
    const filters = {
      sortBy,
      sortOrder,
      minPrice,
      maxPrice,
      inStock:
        inStock === 'true' ? true : inStock === 'false' ? false : undefined,
      onSale:
        onSale === 'true' ? true : onSale === 'false' ? false : undefined,
      productName,
    };

    if (categoryId) {
      return this.productsService.findByCategory(
        categoryId,
        page,
        limit,
        filters,
      );
    }
    return this.productsService.findAll(page, limit, filters);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products' })
  @ApiQuery({ name: 'page', required: true, type: Number })
  @ApiQuery({ name: 'limit', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'Return matching products' })
  search(
    @Query('q') query: string,
    @Query('quick') quick: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    console.log(quick)
    if (quick == 'true') {
      return this.productsService.quickSearch(query, page, limit);
    }
    return this.productsService.search(query, page, limit);
  }

  @Get('home')
  @ApiOperation({ summary: 'Get home screen data' })
  @ApiResponse({ status: 200, description: 'Return home screen data' })
  getHomeScreen() {
    return this.productsService.getHomeScreen();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by id' })
  @ApiResponse({ status: 200, description: 'Return the product.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }
}
