import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { PatientService } from './patient.service';

import { CreatePatientProfileDto } from './dto/create-patient-profile.dto';
import { UpdatePatientProfileDto } from './dto/update-patient-profile.dto';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

import { RolesGuard } from '../common/guards/roles.guard';

import { Roles } from '../common/decorators/roles.decorator';

import { Role } from '../common/enums/role.enum';

@Controller('patient')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PATIENT)
export class PatientController {
  constructor(
    private readonly patientService: PatientService,
  ) {}

  @Post('profile')
  create(
    @Req() req: any,
    @Body()
    createPatientProfileDto: CreatePatientProfileDto,
  ) {
    return this.patientService.create(
      req.user.id,
      createPatientProfileDto,
    );
  }

  @Get('profile')
  findOne(
    @Req() req: any,
  ) {
    return this.patientService.findOne(
      req.user.id,
    );
  }

  @Patch('profile')
  update(
    @Req() req: any,
    @Body()
    updatePatientProfileDto: UpdatePatientProfileDto,
  ) {
    return this.patientService.update(
      req.user.id,
      updatePatientProfileDto,
    );
  }
}