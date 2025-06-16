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

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
} 