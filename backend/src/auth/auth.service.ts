import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  
  import * as bcrypt from 'bcrypt';
  
  import { JwtService } from '@nestjs/jwt';
  
  import { UsersService } from '../users/users.service';
  
  import { SignupDto } from './dto/signup.dto';
  import { LoginDto } from './dto/login.dto';
  
  @Injectable()
  export class AuthService {
    constructor(
      private readonly usersService: UsersService,
      private readonly jwtService: JwtService,
    ) {}
  
    async signup(signupDto: SignupDto) {
      const existingUser = await this.usersService.findByEmail(
        signupDto.email,
      );
  
      if (existingUser) {
        throw new BadRequestException(
          'User already exists with this email',
        );
      }
  
      const hashedPassword = await bcrypt.hash(
        signupDto.password,
        10,
      );
  
      const user = await this.usersService.create({
        name: signupDto.name,
        email: signupDto.email,
        password: hashedPassword,
        role: signupDto.role,
      });
  
      return {
        message: 'User registered successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    }
  
    async login(loginDto: LoginDto) {
      const user = await this.usersService.findByEmail(
        loginDto.email,
      );
  
      if (!user) {
        throw new UnauthorizedException(
          'Invalid credentials',
        );
      }
  
      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );
  
      if (!isPasswordValid) {
        throw new UnauthorizedException(
          'Invalid credentials',
        );
      }
  
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };
  
      const accessToken = await this.jwtService.signAsync(
        payload,
      );
  
      return {
        accessToken,
      };
    }
  }