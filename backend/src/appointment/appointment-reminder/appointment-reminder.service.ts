import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Appointment } from '../entities/appointment.entity';
import { RecurringAvailability } from '../../availability/entities/recurring-availability.entity';

import { NotificationService } from '../../notification/notification.service';
import { AppointmentStatus } from '../enums/appointment-status.enum';

import { NotificationType } from '../../notification/enums/notification-type.enum';
import { DayOfWeek } from '../../common/enums/day-of-week.enum';
import { SchedulingType } from '../../common/enums/scheduling-type.enum';

@Injectable()
export class AppointmentReminderService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,

    @InjectRepository(RecurringAvailability)
    private readonly recurringRepository: Repository<RecurringAvailability>,

    private readonly notificationService: NotificationService,
  ) {}

  @Cron('* * * * *')
  async handleAppointmentReminder() {
    const appointments =
      await this.appointmentRepository.find({
        where: {
          status: AppointmentStatus.BOOKED,
          reminderSent: false,
        },
        relations: {
          patientProfile: true,
          doctorProfile: true,
        },
      });

    for (const appointment of appointments) {
      const appointmentDateTime = new Date(
        `${appointment.date}T${appointment.startTime}:00`,
      );

      const diffInMinutes =
        (appointmentDateTime.getTime() -
          Date.now()) /
        (1000 * 60);

      const appointmentDay = new Date(
        appointment.date,
      ).getDay();

      const days = [
        DayOfWeek.SUNDAY,
        DayOfWeek.MONDAY,
        DayOfWeek.TUESDAY,
        DayOfWeek.WEDNESDAY,
        DayOfWeek.THURSDAY,
        DayOfWeek.FRIDAY,
        DayOfWeek.SATURDAY,
      ];

      const availability =
        await this.recurringRepository.findOne({
          where: {
            doctorProfile: {
              id: appointment.doctorProfile.id,
            },
            dayOfWeek:
              days[appointmentDay],
          },
          relations: {
            doctorProfile: true,
          },
        });

      if (
        diffInMinutes > 0 &&
        diffInMinutes <= 60
      ) {
        let message: string;

        if (
          availability?.schedulingType ===
          SchedulingType.WAVE
        ) {
          message = `Reminder: You have an appointment with ${appointment.doctorProfile.fullName} today.

Reporting Time: ${appointment.startTime}
Token Number: ${appointment.tokenNumber}`;
        } else {
          message = `Reminder: You have an appointment with ${appointment.doctorProfile.fullName} on ${appointment.date} at ${appointment.startTime}.`;
        }

        await this.notificationService.createNotification(
          appointment.patientProfile.id,
          'Appointment Reminder',
          message,
          NotificationType.APPOINTMENT_REMINDER,
        );

        appointment.reminderSent = true;

        await this.appointmentRepository.save(
          appointment,
        );

        console.log(
          `Appointment reminder sent: ${appointment.id}`,
        );
      }
    }
  }
}