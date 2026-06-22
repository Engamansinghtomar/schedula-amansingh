import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { DoctorService } from './doctor.service';

import { CreateDoctorProfileDto } from './dto/create-doctor-profile.dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

import { RolesGuard } from '../common/guards/roles.guard';

import { Roles } from '../common/decorators/roles.decorator';

import { Role } from '../common/enums/role.enum';

@Controller('doctor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DOCTOR)
export class DoctorController {
  constructor(
    private readonly doctorService: DoctorService,
  ) {}

  @Post('profile')
  create(
    @Req() req: any,
    @Body()
    createDoctorProfileDto: CreateDoctorProfileDto,
  ) {
    return this.doctorService.create(
      req.user.id,
      createDoctorProfileDto,
    );
  }

  @Get('profile')
  findOne(
    @Req() req: any,
  ) {
    return this.doctorService.findOne(
      req.user.id,
    );
  }

  @Patch('profile')
  update(
    @Req() req: any,
    @Body()
    updateDoctorProfileDto: UpdateDoctorProfileDto,
  ) {
    return this.doctorService.update(
      req.user.id,
      updateDoctorProfileDto,
    );
  }
}