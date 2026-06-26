import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';

import { DoctorProfile } from './entities/doctor-profile.entity';

import { UsersModule } from '../users/users.module';

import { Appointment } from '../appointment/entities/appointment.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      DoctorProfile,
      Appointment,
    ]),
    UsersModule,
  ],
  controllers: [DoctorController],
  providers: [DoctorService],
})
export class DoctorModule {}