import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsUUID, Min, IsOptional, IsArray, IsEnum, IsBoolean } from 'class-validator';
import { Gender } from '../enums/gender.enum';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Product description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Product price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Product MRP (maximum retail price)', required: false })
  @IsNumber()
  @Min(0)
  mrp?: number;

  @ApiProperty({ description: 'Product stock quantity' })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ description: 'Product brand name' })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Product images',
    required: false,
  })
  @IsOptional()
  images?: any[];

  @ApiProperty({ description: 'Category ID' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ enum: Gender, description: 'Gender', required: false })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiProperty({ description: 'Is deal of the week?', required: false })
  @IsBoolean()
  @IsOptional()
  isDealOfTheWeek?: boolean;

  @ApiProperty({ description: 'Is sponsored product?', required: false })
  @IsBoolean()
  @IsOptional()
  isSponsored?: boolean;

  @ApiProperty({ description: 'Is featured product?', required: false })
  @IsBoolean()
  @IsOptional()
  isFeaturedProduct?: boolean;

  @ApiProperty({ description: 'Is popular on site?', required: false })
  @IsBoolean()
  @IsOptional()
  isPopularOnSite?: boolean;

  @ApiProperty({ description: 'Is active?', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'GST rate', required: false })
  @IsNumber()
  @IsOptional()
  gstRate?: number;
}
