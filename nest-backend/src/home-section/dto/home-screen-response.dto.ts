import { ApiProperty } from '@nestjs/swagger';

class ProductDto {
  @ApiProperty({ description: 'Product ID' })
  id: string;

  @ApiProperty({ description: 'Product name' })
  name: string;

  @ApiProperty({ description: 'Product price' })
  price: number;

  @ApiProperty({ description: 'Product MRP (Maximum Retail Price)', required: false })
  mrp?: number;

  @ApiProperty({ description: 'Product brand', required: false })
  brand?: string;

  @ApiProperty({ description: 'Product stock quantity' })
  stock: number;

  @ApiProperty({ description: 'Whether the product is a deal of the week' })
  isDealOfTheWeek: boolean;

  @ApiProperty({ description: 'Whether the product is sponsored' })
  isSponsored: boolean;

  @ApiProperty({ description: 'Product images URLs', type: [String] })
  images: string[];
}

class CategoryDto {
  @ApiProperty({ description: 'Category ID' })
  id: string;

  @ApiProperty({ description: 'Category name' })
  name: string;

  @ApiProperty({ description: 'Category description' })
  description: string;

  @ApiProperty({ description: 'Category image URL', required: false })
  image?: string;
}

class HomeSectionResponseDto {
  @ApiProperty({ description: 'Home section ID' })
  id: string;

  @ApiProperty({ description: 'Home section title' })
  title: string;

  @ApiProperty({ description: 'Home section type' })
  type: string;

  @ApiProperty({ description: 'Display order of the section' })
  order: number;

  @ApiProperty({ description: 'Additional metadata for the section', type: 'object' })
  metadata: Record<string, any>;

  @ApiProperty({ description: 'Products in this section', type: [ProductDto], required: false })
  products?: ProductDto[];

  @ApiProperty({ description: 'Categories in this section', type: [CategoryDto], required: false })
  categories?: CategoryDto[];
}

export class HomeScreenResponseDto {
  @ApiProperty({ type: [HomeSectionResponseDto] })
  sections: HomeSectionResponseDto[];

  @ApiProperty({ 
    description: 'List of all available section names for reference', 
    type: [String],
    example: ['banner', 'product_list', 'category_list', 'deal_list', 'sponsored_list', 'gender_shop', 'popular_products', 'featured_coupons', 'game_day']
  })
  availableSectionTypes: string[];
}