import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { Country, State, City } from '../enums/location.enum';

export class CreateAddressDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  pincode: string;

  @ApiProperty()
  @IsString()
  addressLine1: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiProperty({ enum: City })
  @IsEnum(City)
  city: City;

  @ApiProperty({ enum: State })
  @IsEnum(State)
  state: State;

  @ApiProperty({ enum: Country })
  @IsEnum(Country)
  country: Country;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  landmark?: string;

  @ApiProperty({ enum: ['Home', 'Work', 'Other'], default: 'Home' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
} 