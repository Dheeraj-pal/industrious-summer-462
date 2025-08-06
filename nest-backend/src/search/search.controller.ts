import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('products')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Search products' })
  @ApiQuery({ name: 'query', required: true })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiResponse({ status: 200, description: 'Return search results.' })
  async searchProducts(
    @Query('query') query: string,
    @Query('categoryId') categoryId?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.searchService.searchProducts(query, categoryId, page, limit);
  }
} 