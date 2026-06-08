import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';

import { PatientProfile } from './entities/patient-profile.entity';

import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PatientProfile]),
    UsersModule,
  ],
  controllers: [PatientController],
  providers: [PatientService],
})
export class PatientModule {}