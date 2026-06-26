import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';

import { Appointment } from './entities/appointment.entity';

import { User } from '../users/entities/user.entity';
import { DoctorProfile } from '../doctor/entities/doctor-profile.entity';
import { PatientProfile } from '../patient/entities/patient-profile.entity';

import { RecurringAvailability } from '../availability/entities/recurring-availability.entity';
import { CustomAvailability } from '../availability/entities/custom-availability.entity';

import { AvailabilityModule } from '../availability/availability.module';

import { NotificationModule } from '../notification/notification.module';
import { AppointmentReminderService } from './appointment-reminder/appointment-reminder.service';



@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      User,
      DoctorProfile,
      PatientProfile,
      RecurringAvailability,
      CustomAvailability,
     
    ]),
    AvailabilityModule,
    NotificationModule,
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService, AppointmentReminderService],
})
export class AppointmentModule {}