import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsArray, IsBoolean, IsDate, IsUUID, Min } from 'class-validator';

export class CreateCouponDto {
    @ApiProperty({ description: 'Coupon code', example: 'WELCOME10' })
    @IsString()
    code: string;
  
    @ApiProperty({ description: 'Coupon description', example: '10% off for new users' })
    @IsString()
    description: string;
  
    @ApiProperty({ description: 'Discount type', enum: ['percentage', 'fixed', 'free_shipping', 'buy_x_get_y'] })
    @IsEnum(['percentage', 'fixed', 'free_shipping', 'buy_x_get_y'])
    discountType: string;
  
    @ApiProperty({ description: 'Discount value', example: 10 })
    @IsNumber()
    discountValue: number;
  
    @ApiProperty({ description: 'Minimum order amount', required: false, example: 100 })
    @IsNumber()
    @IsOptional()
    minOrderAmount?: number;
  
    @ApiProperty({ description: 'Maximum discount value', required: false, example: 100 })
    @IsNumber()
    @IsOptional()
    maxDiscount?: number;
  
    @ApiProperty({ description: 'Start date', required: false, type: String, format: 'date-time' })
    @IsOptional()
    startDate?: Date;
  
    @ApiProperty({ description: 'End date', required: false, type: String, format: 'date-time' })
    @IsOptional()
    endDate?: Date;
  
    @ApiProperty({ description: 'Usage limit', required: false, example: 100 })
    @IsNumber()
    @IsOptional()
    usageLimit?: number;
  
    @ApiProperty({ description: 'Usage limit per user', required: false, example: 1 })
    @IsNumber()
    @IsOptional()
    usageLimitPerUser?: number;
  
    @ApiProperty({ description: 'Applicable product IDs', required: false, type: [String] })
    @IsArray()
    @IsOptional()
    applicableProducts?: string[];
  
    @ApiProperty({ description: 'Applicable category IDs', required: false, type: [String] })
    @IsArray()
    @IsOptional()
    applicableCategories?: string[];
  
    @ApiProperty({ description: 'Applicable user groups', required: false, type: [String] })
    @IsArray()
    @IsOptional()
    applicableUserGroups?: string[];
  
    @ApiProperty({ description: 'First order only', required: false, example: false })
    @IsBoolean()
    @IsOptional()
    firstOrderOnly?: boolean;
  
    @ApiProperty({ description: 'Is active', required: false, example: true })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
  
    @ApiProperty({ description: 'Auto apply', required: false, example: false })
    @IsBoolean()
    @IsOptional()
    autoApply?: boolean;
  
    @ApiProperty({ description: 'Is stackable', required: false, example: false })
    @IsBoolean()
    @IsOptional()
    isStackable?: boolean;
  }