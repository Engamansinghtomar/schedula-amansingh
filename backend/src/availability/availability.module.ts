import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RecurringAvailability } from './entities/recurring-availability.entity';
import { CustomAvailability } from './entities/custom-availability.entity';

import { DoctorProfile } from '../doctor/entities/doctor-profile.entity';

import { UsersModule } from '../users/users.module';

import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecurringAvailability,
      CustomAvailability,
      DoctorProfile,
    ]),
    UsersModule,
  ],
  providers: [AvailabilityService],
  exports: [AvailabilityService],
  controllers: [AvailabilityController],
})
export class AvailabilityModule {}