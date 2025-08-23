import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsOptional, IsUrl } from 'class-validator';

export class OrderPaymentDto {
  @ApiProperty({
    description: 'Order ID to process payment for',
  })
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @ApiPropertyOptional({
    description: 'Success URL to redirect after successful payment',
  })
  @IsUrl()
  @IsOptional()
  successUrl?: string;

  @ApiPropertyOptional({
    description: 'Cancel URL to redirect if payment is cancelled',
  })
  @IsUrl()
  @IsOptional()
  cancelUrl?: string;
}

export class VerifyPaymentDto {
  @ApiProperty({
    description: 'Stripe session ID to verify payment',
  })
  @IsString()
  @IsNotEmpty()
  sessionId: string;
}