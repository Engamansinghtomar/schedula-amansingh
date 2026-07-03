import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RecurringAvailability } from './entities/recurring-availability.entity';
import { CustomAvailability } from './entities/custom-availability.entity';

import { DoctorProfile } from '../doctor/entities/doctor-profile.entity';
import { Appointment } from '../appointment/entities/appointment.entity';

import { UsersModule } from '../users/users.module';

import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';

import { NotificationModule } from '../notification/notification.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecurringAvailability,
      CustomAvailability,
      DoctorProfile,
      Appointment,
    ]),
    UsersModule,
    NotificationModule,
  ],
  providers: [AvailabilityService],
  exports: [AvailabilityService],
  controllers: [AvailabilityController],
})
export class AvailabilityModule {}