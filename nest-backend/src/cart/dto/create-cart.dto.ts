import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateCartDto {
  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  userId: string;
} 