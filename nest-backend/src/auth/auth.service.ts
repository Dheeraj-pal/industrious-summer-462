import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload, { secret: this.configService.get('app.jwt.secret') }),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    };
  }

  async signup(signupDto: SignupDto) {
    const existingUser = await this.usersService.findByEmail(signupDto.email);
    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }
    const user = (await this.usersService.create({
      email: signupDto.email,
      firstName: signupDto.firstName,
      lastName: signupDto.lastName,
      password: signupDto.password,
      role: 'customer'
    }));

    const userInstance = plainToInstance(User, user);
    const { password: _, ...result } = userInstance;
    return this.login(result);
  }
}
