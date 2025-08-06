import { PartialType } from '@nestjs/swagger';
import { CreateAddressDto } from '../../addresses/dto/create-address.dto';

export class UpdateAddressDto extends PartialType(CreateAddressDto) {} 