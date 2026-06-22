import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
  } from '@nestjs/common';
  
  import { InjectRepository } from '@nestjs/typeorm';
  
  import { Repository } from 'typeorm';
  
  import { Appointment } from './entities/appointment.entity';
  
  import { DoctorProfile } from '../doctor/entities/doctor-profile.entity';
  import { PatientProfile } from '../patient/entities/patient-profile.entity';
  
  import { AppointmentStatus } from './enums/appointment-status.enum';

  import { RecurringAvailability } from '../availability/entities/recurring-availability.entity';
import { CustomAvailability } from '../availability/entities/custom-availability.entity';
import { DayOfWeek } from '../common/enums/day-of-week.enum';
  
  @Injectable()
  export class AppointmentService {
    constructor(
      @InjectRepository(Appointment)
      private readonly appointmentRepository: Repository<Appointment>,
  
      @InjectRepository(DoctorProfile)
      private readonly doctorRepository: Repository<DoctorProfile>,
  
      @InjectRepository(PatientProfile)
      private readonly patientRepository: Repository<PatientProfile>,

      @InjectRepository(RecurringAvailability)
      private readonly recurringRepository: Repository<RecurringAvailability>,

      @InjectRepository(CustomAvailability)
      private readonly customRepository: Repository<CustomAvailability>,
    ) {}
  
    async bookAppointment(
      userId: string,
      doctorId: string,
      date: string,
      startTime: string,
      endTime: string,
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
    
      const patient =
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
    
      if (!patient) {
        throw new NotFoundException(
          'Patient profile not found',
        );
      }
    
      const appointmentDateTime =
        new Date(
          `${date}T${startTime}:00`,
        );
    
      if (
        appointmentDateTime <= new Date()
      ) {
        throw new BadRequestException(
          'Appointment must be booked for a future date and time',
        );
      }
    
      const requestedDate =
        new Date(date);
    
      const days = [
        DayOfWeek.SUNDAY,
        DayOfWeek.MONDAY,
        DayOfWeek.TUESDAY,
        DayOfWeek.WEDNESDAY,
        DayOfWeek.THURSDAY,
        DayOfWeek.FRIDAY,
        DayOfWeek.SATURDAY,
      ];
    
      const dayOfWeek =
        days[requestedDate.getDay()];
    
      let slotExists = false;
    
      const customAvailability =
        await this.customRepository.find({
          where: {
            doctorProfile: {
              id: doctorId,
            },
            date,
          },
          relations: {
            doctorProfile: true,
          },
        });
    
      if (customAvailability.length > 0) {
        slotExists =
          customAvailability.some(
            (slot) =>
              slot.startTime ===
                startTime &&
              slot.endTime === endTime,
          );
      } else {
        const recurringAvailability =
          await this.recurringRepository.find({
            where: {
              doctorProfile: {
                id: doctorId,
              },
              dayOfWeek,
            },
            relations: {
              doctorProfile: true,
            },
          });
    
        slotExists =
          recurringAvailability.some(
            (slot) =>
              slot.startTime ===
                startTime &&
              slot.endTime === endTime,
          );
      }
    
      if (!slotExists) {
        throw new BadRequestException(
          'Selected slot is not available',
        );
      }
    
      const existingAppointment =
        await this.appointmentRepository.findOne({
          where: {
            doctorProfile: {
              id: doctorId,
            },
            date,
            startTime,
            endTime,
            status:
              AppointmentStatus.BOOKED,
          },
          relations: {
            doctorProfile: true,
          },
        });
    
      if (existingAppointment) {
        throw new ConflictException(
          'Slot already booked',
        );
      }
    
      const appointment =
        this.appointmentRepository.create({
          doctorProfile: doctor,
          patientProfile: patient,
          date,
          startTime,
          endTime,
          status:
            AppointmentStatus.BOOKED,
        });
    
      return this.appointmentRepository.save(
        appointment,
      );
    }
  
    async getMyAppointments(
      userId: string,
    ) {
      const patient =
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
    
      if (!patient) {
        throw new NotFoundException(
          'Patient profile not found',
        );
      }
    
      const appointments =
        await this.appointmentRepository.find({
          where: {
            patientProfile: {
              id: patient.id,
            },
          },
          relations: {
            doctorProfile: true,
          },
          order: {
            date: 'DESC',
          },
        });
    
      if (!appointments.length) {
        throw new NotFoundException(
          'No appointments found',
        );
      }
    
      return appointments;
    }

    async getDoctorAppointments(
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
    
      const appointments =
        await this.appointmentRepository.find({
          where: {
            doctorProfile: {
              id: doctor.id,
            },
          },
          relations: {
            patientProfile: true,
          },
          order: {
            date: 'DESC',
          },
        });
    
      if (!appointments.length) {
        throw new NotFoundException(
          'No appointments found',
        );
      }
    
      return appointments;
    }

      async cancelAppointment(
        userId: string,
        appointmentId: string,
      ) {
        const patient =
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
      
        if (!patient) {
          throw new NotFoundException(
            'Patient profile not found',
          );
        }
      
        const appointment =
          await this.appointmentRepository.findOne({
            where: {
              id: appointmentId,
            },
            relations: {
              patientProfile: true,
            },
          });
      
        if (!appointment) {
          throw new NotFoundException(
            'Appointment not found',
          );
        }
      
        if (
          appointment.patientProfile.id !==
          patient.id
        ) {
          throw new ConflictException(
            'You can only cancel your own appointment',
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
      
        const appointmentDateTime =
          new Date(
            `${appointment.date}T${appointment.startTime}:00`,
          );
      
        if (
          appointmentDateTime <= new Date()
        ) {
          throw new BadRequestException(
            'Past appointments cannot be cancelled',
          );
        }
      
        appointment.status =
          AppointmentStatus.CANCELLED;
      
        return this.appointmentRepository.save(
          appointment,
        );
      }
  }