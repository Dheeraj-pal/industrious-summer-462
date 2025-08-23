import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, ValidateNested, IsUUID, IsOptional, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from './create-order-item.dto';
import { DeliveryOption, PaymentMethod } from '../entities/order.entity';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Array of order items',
    type: [CreateOrderItemDto],
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiProperty({
    description: 'Shipping address ID',
  })
  @IsUUID()
  shippingAddressId: string;

  @ApiPropertyOptional({
    description: 'Coupon code to apply to the order',
  })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({
    description: 'Payment method',
    enum: PaymentMethod,
    default: PaymentMethod.CARD
  })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Delivery option',
    enum: DeliveryOption,
    default: DeliveryOption.STANDARD
  })
  @IsEnum(DeliveryOption)
  @IsOptional()
  deliveryOption?: DeliveryOption;

  @ApiPropertyOptional({
    description: 'Additional notes for the order',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}