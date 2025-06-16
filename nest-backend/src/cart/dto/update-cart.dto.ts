import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class UpdateCartDto {
  @ApiProperty({ description: 'Total amount of the cart' })
  @IsNumber()
  @Min(0)
  totalAmount: number;
} 