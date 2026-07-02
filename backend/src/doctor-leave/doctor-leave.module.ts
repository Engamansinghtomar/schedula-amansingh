import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DoctorLeave } from './entities/doctor-leave.entity';

import { DoctorLeaveController } from './doctor-leave.controller';
import { DoctorLeaveService } from './doctor-leave.service';

import { Appointment } from '../appointment/entities/appointment.entity';
import { DoctorModule } from '../doctor/doctor.module';

@Module({
  imports: [TypeOrmModule.forFeature([
    DoctorLeave,
    Appointment,
  ]),
  DoctorModule,
],
  controllers: [DoctorLeaveController],
  providers: [DoctorLeaveService],
})
export class DoctorLeaveModule {}