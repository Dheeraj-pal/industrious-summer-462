import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electronics' })
  @IsString()
  name: string;

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

  @ApiProperty({ example: true, required: false, description: 'Is the category active' })
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: 18, required: false, description: 'GST rate for the category' })
  @IsOptional()
  gstRate?: number;
} 