import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UUIDUtil } from '../common/utils/uuid.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto, currentUser?: User) {
    // Check if trying to create an admin user
    if (createUserDto.role === 'admin') {
      // Only super admin can create admin users
      if (!currentUser || currentUser.role !== 'super_admin') {
        throw new UnauthorizedException('Only super admin can create admin users');
      }
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: createUserDto.role ? Role[createUserDto.role.toUpperCase()] : Role.USER, // Convert string role to enum
    });
    const savedUser = await this.usersRepository.save(user);
    const { password, ...result } = savedUser;
    return result;
  }

  async findAll(page = 1, limit = 10): Promise<{ items: User[]; total: number }> {
    const [items, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' }
    });

    return { items, total };
  }

  async findOne(id: string) {
    // Validate UUID format first
    UUIDUtil.validateUUID(id, 'User ID');

    const user = await this.usersRepository.findOne({ where: { id }, relations: ['addresses'] });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const { password, createdAt, updatedAt, ...result } = user;
    return result;
  }

  async findByEmail(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (user) {
      return user;
    }
    return null;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Validate UUID format first
    UUIDUtil.validateUUID(id, 'User ID');

    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    if (updateUserDto.email) {
      user.email = updateUserDto.email;
    }
    if (updateUserDto.firstName) {
      user.firstName = updateUserDto.firstName;
    }
    if (updateUserDto.lastName) {
      user.lastName = updateUserDto.lastName;
    }
    if (updateUserDto.role) {
      user.role = Role[updateUserDto.role.toUpperCase()];
    }

    const updatedUser = await this.usersRepository.save(user);
    const { password, ...result } = updatedUser;
    return result;
  }

  async remove(id: string) {
    // Validate UUID format first
    UUIDUtil.validateUUID(id, 'User ID');

    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.usersRepository.remove(user);
    return { message: 'User successfully deleted' };
  }

  async count(): Promise<number> {
    return this.usersRepository.count();
  }
}
