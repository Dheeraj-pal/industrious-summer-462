import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderStatus } from '../../orders/entities/order.entity';

export class UpdateOrderStatusDto {
  @ApiProperty({ 
    enum: OrderStatus,
    example: OrderStatus.PROCESSING,
    description: 'New status for the order'
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;
} 