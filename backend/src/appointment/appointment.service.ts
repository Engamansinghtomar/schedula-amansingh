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
  
  import { SchedulingType } from '../common/enums/scheduling-type.enum';
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

          const waveAvailability =
          recurringAvailability.find(
            (slot) =>
              slot.schedulingType ===
              SchedulingType.WAVE,
          );
        
        if (waveAvailability) {
          slotExists =
            startTime ===
              waveAvailability.startTime &&
            endTime ===
              waveAvailability.endTime;
        }  
      }
    
      if (!slotExists) {
        throw new BadRequestException(
          'Selected slot is not available',
        );
      }
    
      let tokenNumber: number | undefined;

      const waveAvailability =
        await this.recurringRepository.findOne({
          where: {
            doctorProfile: {
              id: doctorId,
            },
            dayOfWeek,
            schedulingType:
              SchedulingType.WAVE,
          },
          relations: {
            doctorProfile: true,
          },
        });
      
      if (!waveAvailability) {
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
      } else {
        const bookedCount =
          await this.appointmentRepository.count({
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
      
        if (
          bookedCount >=
          waveAvailability.maxCapacity
        ) {
          throw new ConflictException(
            'Wave is full',
          );
        }
      
        tokenNumber =
          bookedCount + 1;
      }
      
      const appointment =
        this.appointmentRepository.create({
          doctorProfile: doctor,
          patientProfile: patient,
          date,
          startTime,
          endTime,
          tokenNumber,
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

const minutesRemaining =
  (
    appointmentDateTime.getTime() -
    new Date().getTime()
  ) /
  (1000 * 60);

if (minutesRemaining < 30) {
  throw new BadRequestException(
    'Appointment cannot be cancelled within 30 minutes of start time',
  );
}
      
        appointment.status =
          AppointmentStatus.CANCELLED;
      
        return this.appointmentRepository.save(
          appointment,
        );
      }

      async rescheduleAppointment(
        userId: string,
        appointmentId: string,
        date: string,
        startTime: string,
        endTime: string,
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
              doctorProfile: true,
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
            'You can only reschedule your own appointment',
          );
        }
      
        if (
          appointment.status ===
          AppointmentStatus.CANCELLED
        ) {
          throw new ConflictException(
            'Cancelled appointment cannot be rescheduled',
          );
        }
      
        const currentAppointmentDateTime =
          new Date(
            `${appointment.date}T${appointment.startTime}:00`,
          );
      
        const minutesRemaining =
          (
            currentAppointmentDateTime.getTime() -
            new Date().getTime()
          ) /
          (1000 * 60);
      
        if (minutesRemaining < 30) {
          throw new BadRequestException(
            'Appointment cannot be rescheduled within 30 minutes of start time',
          );
        }
      
        if (
          appointment.date === date &&
          appointment.startTime === startTime &&
          appointment.endTime === endTime
        ) {
          throw new BadRequestException(
            'Appointment is already scheduled for this slot',
          );
        }
      
        const newAppointmentDateTime =
          new Date(
            `${date}T${startTime}:00`,
          );
      
        if (
          newAppointmentDateTime <=
          new Date()
        ) {
          throw new BadRequestException(
            'Appointment must be rescheduled to a future time',
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
          days[
            requestedDate.getDay()
          ];
      
        let slotExists = false;
      
        const customAvailability =
          await this.customRepository.find({
            where: {
              doctorProfile: {
                id:
                  appointment.doctorProfile.id,
              },
              date,
            },
            relations: {
              doctorProfile: true,
            },
          });
      
        if (
          customAvailability.length > 0
        ) {
          slotExists =
            customAvailability.some(
              (slot) =>
                slot.startTime ===
                  startTime &&
                slot.endTime ===
                  endTime,
            );
        } else {
          const recurringAvailability =
            await this.recurringRepository.find({
              where: {
                doctorProfile: {
                  id:
                    appointment.doctorProfile.id,
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
                slot.endTime ===
                  endTime,
            );
      
          const waveAvailability =
            recurringAvailability.find(
              (slot) =>
                slot.schedulingType ===
                SchedulingType.WAVE,
            );
      
          if (waveAvailability) {
            slotExists =
              startTime ===
                waveAvailability.startTime &&
              endTime ===
                waveAvailability.endTime;
          }
        }
      
        if (!slotExists) {
          const suggestedSlot =
            await this.getSuggestedSlot(
              appointment.doctorProfile.id,
              date,
            );
        
          throw new BadRequestException({
            message:
              'Requested slot unavailable',
            suggestedSlot,
          });
        }
      
        const waveAvailability =
          await this.recurringRepository.findOne({
            where: {
              doctorProfile: {
                id:
                  appointment.doctorProfile.id,
              },
              dayOfWeek,
              schedulingType:
                SchedulingType.WAVE,
            },
            relations: {
              doctorProfile: true,
            },
          });
      
        if (!waveAvailability) {
          const existingAppointment =
            await this.appointmentRepository.findOne({
              where: {
                doctorProfile: {
                  id:
                    appointment.doctorProfile.id,
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
      
          if (
            existingAppointment &&
            existingAppointment.id !==
              appointment.id
          ) {
            throw new ConflictException(
              'Slot already booked',
            );
          }
      
          appointment.tokenNumber = undefined as any;
        } else {
          const bookedCount =
            await this.appointmentRepository.count({
              where: {
                doctorProfile: {
                  id:
                    appointment.doctorProfile.id,
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
      
          if (
            bookedCount >=
            waveAvailability.maxCapacity
          ) {
            throw new ConflictException(
              'Wave is full',
            );
          }
      
          appointment.tokenNumber =
            bookedCount + 1;
        }
      
        appointment.date = date;
        appointment.startTime =
          startTime;
        appointment.endTime =
          endTime;
      
        const updatedAppointment =
          await this.appointmentRepository.save(
            appointment,
          );
      
        return {
          message:
            'Appointment rescheduled successfully',
          appointment:
            updatedAppointment,
        };
      }

        private async getSuggestedSlot(
          doctorId: string,
          date: string,
        ) {
          const customAvailability =
            await this.customRepository.find({
              where: {
                doctorProfile: {
                  id: doctorId,
                },
                date,
              },
              order: {
                startTime: 'ASC',
              },
              relations: {
                doctorProfile: true,
              },
            });
        
          if (customAvailability.length > 0) {
            return {
              date,
              startTime:
                customAvailability[0].startTime,
              endTime:
                customAvailability[0].endTime,
            };
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
            days[
              requestedDate.getDay()
            ];
        
          const recurringAvailability =
            await this.recurringRepository.find({
              where: {
                doctorProfile: {
                  id: doctorId,
                },
                dayOfWeek,
              },
              order: {
                startTime: 'ASC',
              },
              relations: {
                doctorProfile: true,
              },
            });
        
          if (
            recurringAvailability.length > 0
          ) {
            return {
              date,
              startTime:
                recurringAvailability[0].startTime,
              endTime:
                recurringAvailability[0].endTime,
            };
          }
        
          return null;
        }
      }
  