import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';
import { HomeSectionType } from '../entities/home-section.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateHomeSectionDto {
  @ApiProperty({
    description: 'Title of the home section',
    example: 'Featured Products',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Type of the home section',
    enum: HomeSectionType,
    example: HomeSectionType.PRODUCT_LIST,
    enumName: 'HomeSectionType',
  })
  @IsEnum(HomeSectionType)
  type: HomeSectionType;

  @ApiProperty({
    description: 'Display order of the section (lower numbers appear first)',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiProperty({
    description:
      'Additional data for the section based on its type. Examples:\n' +
      '- BANNER/GAME_DAY: { "images": ["url1", "url2"] }\n' +
      '- GENDER_SHOP: { "genderOptions": [{ "imageIndex": 0, "label": "Shop for Him", "targetUrl": "/products?gender=male" }] }\n' +
      '  Note: For GENDER_SHOP, you can use "imageIndex" to reference uploaded images by their index position.\n' +
      '  The backend will automatically replace "imageIndex" with the actual image URL after upload.\n' +
      '- FEATURED_COUPONS: { "coupons": [{ "code": "SAVE20", "discount": "20%", "image": "url" }] }',
    required: false,
    type: 'object',
  })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Array of product IDs to include in this section',
    type: [String],
    required: false,
    example: ['product-uuid-1', 'product-uuid-2'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((v: string) => v.trim());
    }
    return value;
  })
  productIds?: string[];

  @ApiProperty({
    description: 'Array of category IDs to include in this section',
    type: [String],
    required: false,
    example: ['category-uuid-1', 'category-uuid-2'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((v: string) => v.trim());
    }
    return value;
  })
  categoryIds?: string[];

  @ApiProperty({
    description:
      'JSON string mapping images to products: [{imageIndex: 0, productIds: ["id1", "id2"]}]',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  imageProductMappings?: string;

  @ApiProperty({
    description:
      'JSON string mapping images to categories: [{imageIndex: 0, categoryIds: ["id1", "id2"]}]',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  imageCategoryMappings?: string;
}
