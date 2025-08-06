import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({ example: 'Electronics', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Electronic devices and accessories', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Category image',
    required: false,
  })
  @IsOptional()
  image?: any;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: 18, required: false, description: 'GST rate for the category' })
  @IsOptional()
  gstRate?: number;
} 