import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

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

  async getDoctors(
    search?: string,
    specialization?: string,
    availability?: string,
    page = '1',
    limit = '10',
  ) {
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (
      pageNumber <= 0 ||
      limitNumber <= 0
    ) {
      throw new BadRequestException(
        'Page and limit must be greater than 0',
      );
    }

    const queryBuilder =
      this.doctorRepository.createQueryBuilder(
        'doctor',
      );

    if (search) {
      queryBuilder.andWhere(
        'LOWER(doctor.fullName) LIKE LOWER(:search)',
        {
          search: `%${search}%`,
        },
      );
    }

    if (specialization) {
      queryBuilder.andWhere(
        'LOWER(doctor.specialization) = LOWER(:specialization)',
        {
          specialization,
        },
      );
    }

    if (availability) {
      queryBuilder.andWhere(
        'LOWER(doctor.availability) = LOWER(:availability)',
        {
          availability,
        },
      );
    }

    queryBuilder
      .skip(
        (pageNumber - 1) *
          limitNumber,
      )
      .take(limitNumber);

    const [doctors, total] =
      await queryBuilder.getManyAndCount();

    return {
      total,
      page: pageNumber,
      limit: limitNumber,
      data: doctors,
    };
  }

  async getDoctorById(id: string) {
    const doctor =
      await this.doctorRepository.findOne({
        where: {
          id,
        },
      });

    if (!doctor) {
      throw new NotFoundException(
        'Doctor not found',
      );
    }

    return doctor;
  }
}