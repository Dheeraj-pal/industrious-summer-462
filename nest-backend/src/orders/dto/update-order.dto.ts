import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderDto {
  @ApiProperty({ enum: OrderStatus, required: false })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiProperty({ example: '123 Main St, City, Country', required: false })
  @IsString()
  @IsOptional()
  shippingAddress?: string;

  @ApiProperty({ example: 'TRK123456789', required: false })
  @IsString()
  @IsOptional()
  trackingNumber?: string;
} 