import {
    Injectable,
    ConflictException,
    NotFoundException,
  } from '@nestjs/common';
  
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  
  import { DoctorProfile } from './entities/doctor-profile.entity';
  
  import { UsersService } from '../users/users.service';
  
  import { CreateDoctorProfileDto } from './dto/create-doctor-profile.dto';
  import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
  
  @Injectable()
  export class DoctorService {
    constructor(
      @InjectRepository(DoctorProfile)
      private readonly doctorRepository: Repository<DoctorProfile>,
  
      private readonly usersService: UsersService,
    ) {}
  
    async create(
      userId: string,
      createDoctorProfileDto: CreateDoctorProfileDto,
    ) {
      const user =
        await this.usersService.findById(userId);
  
      if (!user) {
        throw new NotFoundException(
          'User not found',
        );
      }
  
      const existingProfile =
        await this.doctorRepository.findOne({
          where: {
            user: {
              id: userId,
            },
          },
          relations: {
            user: true,
          },
        });
  
      if (existingProfile) {
        throw new ConflictException(
          'Doctor profile already exists',
        );
      }
  
      const profile = this.doctorRepository.create({
        ...createDoctorProfileDto,
        user: {
          id: userId,
        } as any,
      });
  
      return this.doctorRepository.save(profile);
    }
  
    async findOne(userId: string) {
      const profile =
        await this.doctorRepository.findOne({
          where: {
            user: {
              id: userId,
            },
          },
          relations: {
            user: true,
          },
        });
  
      if (!profile) {
        throw new NotFoundException(
          'Doctor profile not found',
        );
      }
  
      return profile;
    }
  
    async update(
      userId: string,
      updateDoctorProfileDto: UpdateDoctorProfileDto,
    ) {
      const profile =
        await this.doctorRepository.findOne({
          where: {
            user: {
              id: userId,
            },
          },
          relations: {
            user: true,
          },
        });
  
      if (!profile) {
        throw new NotFoundException(
          'Doctor profile not found',
        );
      }
  
      Object.assign(
        profile,
        updateDoctorProfileDto,
      );
  
      return this.doctorRepository.save(profile);
    }
  }