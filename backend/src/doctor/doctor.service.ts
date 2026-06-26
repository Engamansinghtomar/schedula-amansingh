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

import { Appointment } from '../appointment/entities/appointment.entity';
import { AppointmentStatus } from '../appointment/enums/appointment-status.enum';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(DoctorProfile)
    private readonly doctorRepository: Repository<DoctorProfile>,

    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,

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

    const { password, ...safeUser } =
      profile.user;

    return {
      ...profile,
      user: safeUser,
    };
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

    const updatedProfile =
      await this.doctorRepository.save(
        profile,
      );

    const { password, ...safeUser } =
      updatedProfile.user;

    return {
      ...updatedProfile,
      user: safeUser,
    };
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

  async getMyAppointments(
    
    userId: string,
    date?: string,
  )   {
    console.log('getMyAppointments called');
    const doctor =
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

    if (!doctor) {
      throw new NotFoundException(
        'Doctor profile not found',
      );
    }

    const where: any = {
      doctorProfile: {
        id: doctor.id,
      },
      status: AppointmentStatus.BOOKED,
    };

    if (date) {
      where.date = date;
    }

    return this.appointmentRepository.find({
      where,
      relations: {
        patientProfile: {
          user: true,
        },
      },
      order: {
        date: 'DESC',
      },
    });
  }

  async cancelAppointment(
    userId: string,
    appointmentId: string,
  ) {
    const doctor =
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

    if (!doctor) {
      throw new NotFoundException(
        'Doctor profile not found',
      );
    }

    const appointment =
      await this.appointmentRepository.findOne({
        where: {
          id: appointmentId,
        },
        relations: {
          doctorProfile: true,
        },
      });

    if (!appointment) {
      throw new NotFoundException(
        'Appointment not found',
      );
    }

    if (
      appointment.doctorProfile.id !==
      doctor.id
    ) {
      throw new ConflictException(
        'Unauthorized access',
      );
    }

    if (
      appointment.status ===
      AppointmentStatus.CANCELLED
    ) {
      throw new ConflictException(
        'Appointment already cancelled',
      );
    }

    appointment.status =
      AppointmentStatus.CANCELLED;

    return this.appointmentRepository.save(
      appointment,
    );
  }
}