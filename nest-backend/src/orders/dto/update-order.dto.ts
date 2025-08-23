import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsUUID, IsDate, IsDateString } from 'class-validator';
import { OrderStatus, PaymentStatus, PaymentMethod, DeliveryOption } from '../entities/order.entity';

export class UpdateOrderDto {
  @ApiPropertyOptional({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  shippingAddressId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  paymentIntentId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  stripeSessionId?: string;

  @ApiPropertyOptional({ enum: DeliveryOption })
  @IsEnum(DeliveryOption)
  @IsOptional()
  deliveryOption?: DeliveryOption;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  estimatedDeliveryDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}