import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AddressService } from './address.service';
import { CreateAddressDto } from '../addresses/dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('addresses')
@Controller('addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  @ApiOperation({ summary: 'Get all addresses for the current user' })
  @ApiResponse({ status: 200, description: 'List of addresses' })
  findAll(@Req() req) {
    return this.addressService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single address by id' })
  @ApiResponse({ status: 200, description: 'Address details' })
  findOne(@Req() req, @Param('id') id: string) {
    return this.addressService.findOne(req.user.id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  @ApiResponse({ status: 201, description: 'Address created' })
  create(@Req() req, @Body() dto: CreateAddressDto) {
    return this.addressService.create(req.user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an address' })
  @ApiResponse({ status: 200, description: 'Address updated' })
  update(@Req() req, @Param('id') id: string, @Body() dto: UpdateAddressDto) {
    return this.addressService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an address' })
  @ApiResponse({ status: 200, description: 'Address deleted' })
  remove(@Req() req, @Param('id') id: string) {
    return this.addressService.remove(req.user.id, id);
  }

  @Patch(':id/default')
  @ApiOperation({ summary: 'Set an address as default' })
  @ApiResponse({ status: 200, description: 'Address set as default' })
  setDefault(@Req() req, @Param('id') id: string) {
    return this.addressService.setDefault(req.user.id, id);
  }

  @Get('location/:pincode')
  @ApiOperation({ summary: 'Get location details by pincode' })
  @ApiResponse({ status: 200, description: 'Location details' })
  getLocation(@Param('pincode') pincode: string) {
    return this.addressService.getLocationFromPincode(pincode);
  }
} 