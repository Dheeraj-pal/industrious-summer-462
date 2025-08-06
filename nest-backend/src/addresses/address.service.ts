import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { User } from '../users/entities/user.entity';
import { CreateAddressDto } from '../addresses/dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import axios from 'axios';
import { Country, State, City } from './enums/location.enum';
import { UUIDUtil } from '../common/utils/uuid.util';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async findAll(userId: string): Promise<Address[]> {
    return this.addressRepository.find({ where: { user: { id: userId } }, order: { isDefault: 'DESC', updatedAt: 'DESC' } });
  }

  async findOne(userId: string, id: string): Promise<Address> {
    // Validate UUID format first
    UUIDUtil.validateUUID(id, 'Address ID');
    UUIDUtil.validateUUID(userId, 'User ID');

    const address = await this.addressRepository.findOne({ where: { id, user: { id: userId } } });
    if (!address) throw new NotFoundException('Address not found');
    return address;
  }

  async getLocationFromPincode(pincode: string): Promise<{ country: Country; state: State; city: City }> {
    const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = response.data[0];
    if (data.Status !== 'Success' || !data.PostOffice || !data.PostOffice.length) {
      throw new Error('Invalid pincode or location not found');
    }
    const postOffice = data.PostOffice.filter(p => p.DeliveryStatus === 'Delivery');

    const state: State = postOffice[0].State;
    const city: City = postOffice[0].District;
    const country: Country = postOffice[0].Country;
    return {
      country,
      state,
      city,
    };
  }

  async create(userId: string, dto: CreateAddressDto): Promise<Address> {
    // Validate UUID format first
    UUIDUtil.validateUUID(userId, 'User ID');

    if ((!dto.country || !dto.state || !dto.city) && dto.pincode) {
      const location = await this.getLocationFromPincode(dto.pincode);
      dto.country = location.country;
      dto.state = location.state;
      dto.city = location.city;
    }
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (dto.isDefault) {
      await this.addressRepository.update({ user: { id: userId } }, { isDefault: false });
    }
    const address = this.addressRepository.create({ ...dto, user });
    return this.addressRepository.save(address);
  }

  async update(userId: string, id: string, dto: UpdateAddressDto): Promise<Address> {
    // Validate UUID format first
    UUIDUtil.validateUUID(id, 'Address ID');
    UUIDUtil.validateUUID(userId, 'User ID');

    if ((!dto.country || !dto.state || !dto.city) && dto.pincode) {
      const location = await this.getLocationFromPincode(dto.pincode);
      dto.country = location.country;
      dto.state = location.state;
      dto.city = location.city;
    }
    const address = await this.findOne(userId, id);
    if (dto.isDefault) {
      await this.addressRepository.update({ user: { id: userId } }, { isDefault: false });
    }
    Object.assign(address, dto);
    return this.addressRepository.save(address);
  }

  async remove(userId: string, id: string): Promise<void> {
    // Validate UUID format first
    UUIDUtil.validateUUID(id, 'Address ID');
    UUIDUtil.validateUUID(userId, 'User ID');

    const address = await this.findOne(userId, id);
    await this.addressRepository.remove(address);
  }

  async setDefault(userId: string, id: string): Promise<Address> {
    // Validate UUID format first
    UUIDUtil.validateUUID(id, 'Address ID');
    UUIDUtil.validateUUID(userId, 'User ID');

    const address = await this.findOne(userId, id);
    await this.addressRepository.update({ user: { id: userId } }, { isDefault: false });
    address.isDefault = true;
    return this.addressRepository.save(address);
  }
} 