import {
    Injectable,
    ConflictException,
    NotFoundException,
  } from '@nestjs/common';
  
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  
  import { PatientProfile } from './entities/patient-profile.entity';
  
  import { UsersService } from '../users/users.service';
  
  import { CreatePatientProfileDto } from './dto/create-patient-profile.dto';
  import { UpdatePatientProfileDto } from './dto/update-patient-profile.dto';
  
  @Injectable()
  export class PatientService {
    constructor(
      @InjectRepository(PatientProfile)
      private readonly patientRepository: Repository<PatientProfile>,
  
      private readonly usersService: UsersService,
    ) {}
  
    async create(
      userId: string,
      createPatientProfileDto: CreatePatientProfileDto,
    ) {
      const user =
        await this.usersService.findById(userId);
  
      if (!user) {
        throw new NotFoundException(
          'User not found',
        );
      }
  
      const existingProfile =
        await this.patientRepository.findOne({
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
          'Patient profile already exists',
        );
      }
  
      const profile = this.patientRepository.create({
        ...createPatientProfileDto,
        user: {
          id: userId,
        } as any,
      });
  
      return this.patientRepository.save(profile);
    }
  
    async findOne(userId: string) {
      const profile =
        await this.patientRepository.findOne({
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
          'Patient profile not found',
        );
      }
  
      return profile;
    }
  
    async update(
      userId: string,
      updatePatientProfileDto: UpdatePatientProfileDto,
    ) {
      const profile =
        await this.patientRepository.findOne({
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
          'Patient profile not found',
        );
      }
  
      Object.assign(
        profile,
        updatePatientProfileDto,
      );
  
      return this.patientRepository.save(profile);
    }
  }