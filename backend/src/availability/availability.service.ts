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

import { Appointment } from '../appointment/entities/appointment.entity';
import { AppointmentStatus } from '../appointment/enums/appointment-status.enum';

import { SchedulingType } from '../common/enums/scheduling-type.enum';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(RecurringAvailability)
    private readonly recurringRepository: Repository<RecurringAvailability>,

    @InjectRepository(CustomAvailability)
    private readonly customRepository: Repository<CustomAvailability>,

    @InjectRepository(DoctorProfile)
    private readonly doctorRepository: Repository<DoctorProfile>,

    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,

    private readonly usersService: UsersService,
  ) { }

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
    if (
      dto.schedulingType === 'STREAM'
    ) {
      if (!dto.slotDuration) {
        throw new BadRequestException(
          'Slot duration is required for STREAM scheduling',
        );
      }
    }

    if (
      dto.schedulingType === 'WAVE'
    ) {
      if (!dto.maxCapacity) {
        throw new BadRequestException(
          'Max capacity is required for WAVE scheduling',
        );
      }
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

    if (
      dto.schedulingType === 'STREAM'
    ) {
      if (!dto.slotDuration) {
        throw new BadRequestException(
          'Slot duration is required for STREAM scheduling',
        );
      }
    }

    if (
      dto.schedulingType === 'WAVE'
    ) {
      if (!dto.maxCapacity) {
        throw new BadRequestException(
          'Max capacity is required for WAVE scheduling',
        );
      }
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

    availability.schedulingType =
      dto.schedulingType;

    availability.slotDuration =
      dto.slotDuration;

    availability.bufferTime =
      dto.bufferTime ?? 0;

    availability.maxCapacity =
      dto.maxCapacity;

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

  async getDoctorSlots(
    doctorId: string,
    date: string,
    duration: number,
  ) {
    const doctor =
      await this.doctorRepository.findOne({
        where: {
          id: doctorId,
        },
      });

    if (!doctor) {
      throw new NotFoundException(
        'Doctor not found',
      );
    }

    const [year, month, day] =
      date.split('-').map(Number);

    const requestedDate =
      new Date(
        year,
        month - 1,
        day,
      );

    if (
      Number.isNaN(
        requestedDate.getTime(),
      )
    ) {
      throw new BadRequestException(
        'Invalid date',
      );
    }

    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0,
    );

    requestedDate.setHours(
      0,
      0,
      0,
      0,
    );

    if (requestedDate < today) {
      throw new BadRequestException(
        'Past date is not allowed',
      );
    }

    let availabilitySource =
      'recurring';

    let availabilitySlots:
      | RecurringAvailability[]
      | CustomAvailability[];

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
      availabilitySource =
        'custom_override';

      availabilitySlots =
        customAvailability;
    } else {
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
            dayOfWeek:
              dayOfWeek as any,
          },
          order: {
            startTime: 'ASC',
          },
        });

      if (
        recurringAvailability.length ===
        0
      ) {
        throw new NotFoundException(
          'No availability found for this date',
        );
      }

      availabilitySlots =
        recurringAvailability;

      const waveAvailability =
        recurringAvailability.find(
          (slot) =>
            slot.schedulingType ===
            SchedulingType.WAVE,
        );

      if (waveAvailability) {
        return {
          doctorId,
          date,
          source: availabilitySource,
          schedulingType: 'WAVE',
          startTime:
            waveAvailability.startTime,
          endTime:
            waveAvailability.endTime,
          capacity:
            waveAvailability.maxCapacity,
          available:
            waveAvailability.maxCapacity,
        };
      }
    }

    const generatedSlots: {
      startTime: string;
      endTime: string;
    }[] = [];

    const now = new Date();

    for (const slot of availabilitySlots) {
      const [
        startHour,
        startMinute,
      ] = slot.startTime
        .split(':')
        .map(Number);

      const [
        endHour,
        endMinute,
      ] = slot.endTime
        .split(':')
        .map(Number);

      const start =
        new Date(
          year,
          month - 1,
          day,
        );

      start.setHours(
        startHour,
        startMinute,
        0,
        0,
      );

      const end =
        new Date(
          year,
          month - 1,
          day,
        );

      end.setHours(
        endHour,
        endMinute,
        0,
        0,
      );

      let current =
        new Date(start);

      while (current < end) {
        const next =
          new Date(current);

        next.setMinutes(
          next.getMinutes() +
          duration,
        );

        if (next > end) {
          break;
        }

        if (current > now) {
          generatedSlots.push({
            startTime:
              current
                .toTimeString()
                .slice(0, 5),

            endTime:
              next
                .toTimeString()
                .slice(0, 5),
          });
        }

        current = next;
      }
    }

    if (
      generatedSlots.length === 0
    ) {
      throw new NotFoundException(
        'No slots available',
      );
    }
    const bookedAppointments =
      await this.appointmentRepository.find({
        where: {
          doctorProfile: {
            id: doctorId,
          },
          date,
          status: AppointmentStatus.BOOKED,
        },
        relations: {
          doctorProfile: true,
        },
      });

    const availableSlots =
      generatedSlots.filter(
        (generatedSlot) =>
          !bookedAppointments.some(
            (appointment) =>
              appointment.startTime ===
              generatedSlot.startTime &&
              appointment.endTime ===
              generatedSlot.endTime,
          ),
      );
    return {
      doctorId,
      date,
      duration,
      source: availabilitySource,
      slots: availableSlots,
    };
  }


  async findNextAvailableAppointment(
    doctorId: string,
  ) {
    const doctor =
      await this.doctorRepository.findOne({
        where: {
          id: doctorId,
        },
      });

    if (!doctor) {
      throw new NotFoundException(
        'Doctor not found',
      );
    }
    const currentDate = new Date();

    currentDate.setHours(
      0,
      0,
      0,
      0,
    );
    for (let i = 0; i < 30; i++) {
      const searchDate = new Date(
        currentDate,
      );

      searchDate.setDate(
        currentDate.getDate() + i,
      );

      const date =
        searchDate
          .toISOString()
          .split('T')[0];

      try {
        const slots =
          await this.getDoctorSlots(
            doctorId,
            date,
            15,
          );

        if (
          'slots' in slots &&
          Array.isArray(slots.slots) &&
          slots.slots.length > 0
        ) {
          return slots;
        }

        if ('available' in slots) {
          if ((slots.available ?? 0) > 0) {
            return slots;
          }
        }
      } catch (error) {
        continue;
      }
    }
    throw new NotFoundException(
      'No appointments available in the next 30 working days. Please try again later.',
    );
  }
}