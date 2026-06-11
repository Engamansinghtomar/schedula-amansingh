import {
    Injectable,
    BadRequestException,
    NotFoundException,
    ConflictException,
  } from '@nestjs/common';
  
  import { InjectRepository } from '@nestjs/typeorm';
  
  import { Repository } from 'typeorm';
  
  import { RecurringAvailability } from './entities/recurring-availability.entity';
  import { CustomAvailability } from './entities/custom-availability.entity';
  
  import { DoctorProfile } from '../doctor/entities/doctor-profile.entity';
  
  import { UsersService } from '../users/users.service';
  
  import { CreateRecurringAvailabilityDto } from './dto/create-recurring-availability.dto';
  import { UpdateRecurringAvailabilityDto } from './dto/update-recurring-availability.dto';

  import { CreateCustomAvailabilityDto } from './dto/create-custom-availability.dto';
  
  @Injectable()
  export class AvailabilityService {
    constructor(
      @InjectRepository(RecurringAvailability)
      private readonly recurringRepository: Repository<RecurringAvailability>,
  
      @InjectRepository(CustomAvailability)
      private readonly customRepository: Repository<CustomAvailability>,
  
      @InjectRepository(DoctorProfile)
      private readonly doctorRepository: Repository<DoctorProfile>,
  
      private readonly usersService: UsersService,
    ) {}
  
    async createRecurringAvailability(
      userId: string,
      dto: CreateRecurringAvailabilityDto,
    ) {
      const user =
        await this.usersService.findById(userId);
  
      if (!user) {
        throw new NotFoundException(
          'User not found',
        );
      }
  
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
  
      if (
        dto.startTime >= dto.endTime
      ) {
        throw new BadRequestException(
          'Start time must be before end time',
        );
      }
  
      const existingSlots =
        await this.recurringRepository.find({
          where: {
            doctorProfile: {
              id: doctor.id,
            },
            dayOfWeek: dto.dayOfWeek,
          },
        });
  
      const duplicateSlot =
        existingSlots.find(
          (slot) =>
            slot.startTime === dto.startTime &&
            slot.endTime === dto.endTime,
        );
  
      if (duplicateSlot) {
        throw new ConflictException(
          'Availability slot already exists',
        );
      }
  
      const overlappingSlot =
        existingSlots.find(
          (slot) =>
            dto.startTime < slot.endTime &&
            dto.endTime > slot.startTime,
        );
  
      if (overlappingSlot) {
        throw new ConflictException(
          'Availability slot overlaps with an existing slot',
        );
      }
  
      const availability =
        this.recurringRepository.create({
          ...dto,
          doctorProfile: doctor,
        });
  
      return this.recurringRepository.save(
        availability,
      );
    }
  
    async getRecurringAvailabilities(
      userId: string,
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
  
      return this.recurringRepository.find({
        where: {
          doctorProfile: {
            id: doctor.id,
          },
        },
        order: {
          dayOfWeek: 'ASC',
          startTime: 'ASC',
        },
      });
    }
  
    async updateRecurringAvailability(
      userId: string,
      availabilityId: string,
      dto: UpdateRecurringAvailabilityDto,
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
  
      const availability =
        await this.recurringRepository.findOne({
          where: {
            id: availabilityId,
          },
          relations: {
            doctorProfile: true,
          },
        });
  
      if (!availability) {
        throw new NotFoundException(
          'Availability not found',
        );
      }
  
      if (
        availability.doctorProfile.id !==
        doctor.id
      ) {
        throw new NotFoundException(
          'Availability not found',
        );
      }
  
      if (
        dto.startTime >= dto.endTime
      ) {
        throw new BadRequestException(
          'Start time must be before end time',
        );
      }
  
      const existingSlots =
        await this.recurringRepository.find({
          where: {
            doctorProfile: {
              id: doctor.id,
            },
            dayOfWeek: dto.dayOfWeek,
          },
        });
  
      const duplicateSlot =
        existingSlots.find(
          (slot) =>
            slot.id !== availabilityId &&
            slot.startTime === dto.startTime &&
            slot.endTime === dto.endTime,
        );
  
      if (duplicateSlot) {
        throw new ConflictException(
          'Availability slot already exists',
        );
      }
  
      const overlappingSlot =
        existingSlots.find(
          (slot) =>
            slot.id !== availabilityId &&
            dto.startTime < slot.endTime &&
            dto.endTime > slot.startTime,
        );
  
      if (overlappingSlot) {
        throw new ConflictException(
          'Availability slot overlaps with an existing slot',
        );
      }
  
      availability.dayOfWeek =
        dto.dayOfWeek;
  
      availability.startTime =
        dto.startTime;
  
      availability.endTime =
        dto.endTime;
  
      return this.recurringRepository.save(
        availability,
      );
    }

    async deleteRecurringAvailability(
        userId: string,
        availabilityId: string,
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
      
        const availability =
          await this.recurringRepository.findOne({
            where: {
              id: availabilityId,
            },
            relations: {
              doctorProfile: true,
            },
          });
      
        if (!availability) {
          throw new NotFoundException(
            'Availability not found',
          );
        }
      
        if (
          availability.doctorProfile.id !==
          doctor.id
        ) {
          throw new NotFoundException(
            'Availability not found',
          );
        }
      
        await this.recurringRepository.remove(
          availability,
        );
      
        return {
          message:
            'Availability deleted successfully',
        };
      }

      async createCustomAvailability(
        userId: string,
        dto: CreateCustomAvailabilityDto,
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
      
        if (
          dto.startTime >= dto.endTime
        ) {
          throw new BadRequestException(
            'Start time must be before end time',
          );
        }
      
        const existingOverrides =
          await this.customRepository.find({
            where: {
              doctorProfile: {
                id: doctor.id,
              },
              date: dto.date,
            },
            relations: {
              doctorProfile: true,
            },
          });
      
        const duplicateSlot =
          existingOverrides.find(
            (slot) =>
              slot.startTime === dto.startTime &&
              slot.endTime === dto.endTime,
          );
      
        if (duplicateSlot) {
          throw new ConflictException(
            'Custom availability already exists',
          );
        }
      
        const overlappingSlot =
          existingOverrides.find(
            (slot) =>
              dto.startTime < slot.endTime &&
              dto.endTime > slot.startTime,
          );
      
        if (overlappingSlot) {
          throw new ConflictException(
            'Custom availability overlaps with an existing slot',
          );
        }
      
        const availability =
          this.customRepository.create({
            ...dto,
            doctorProfile: doctor,
          });
      
        return this.customRepository.save(
          availability,
        );
      }
      async getAvailabilityByDate(
        userId: string,
        date: string,
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
      
        const customAvailability =
          await this.customRepository.find({
            where: {
              doctorProfile: {
                id: doctor.id,
              },
              date,
            },
            order: {
              startTime: 'ASC',
            },
          });
      
        if (
          customAvailability.length > 0
        ) {
          return {
            source: 'custom_override',
            slots: customAvailability,
          };
        }
      
        const requestedDate =
          new Date(date);
      
        if (
          Number.isNaN(
            requestedDate.getTime(),
          )
        ) {
          throw new BadRequestException(
            'Invalid date',
          );
        }
      
        const days = [
          'SUNDAY',
          'MONDAY',
          'TUESDAY',
          'WEDNESDAY',
          'THURSDAY',
          'FRIDAY',
          'SATURDAY',
        ];
      
        const dayOfWeek =
          days[
            requestedDate.getDay()
          ];
      
        const recurringAvailability =
          await this.recurringRepository.find({
            where: {
              doctorProfile: {
                id: doctor.id,
              },
              dayOfWeek: dayOfWeek as any,
            },
            order: {
              startTime: 'ASC',
            },
          });
      
        return {
          source: 'recurring',
          slots: recurringAvailability,
        };
      }
      
  }