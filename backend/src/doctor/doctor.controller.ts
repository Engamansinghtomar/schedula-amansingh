import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
  Query,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';

import { DoctorService } from './doctor.service';

import { CreateDoctorProfileDto } from './dto/create-doctor-profile.dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('doctor')
export class DoctorController {
  constructor(
    private readonly doctorService: DoctorService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  @Get('profile')
  findOne(
    @Req() req: any,
  ) {
    return this.doctorService.findOne(
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
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

  @Get()
  getDoctors(
    @Query('search') search?: string,
    @Query('specialization')
    specialization?: string,
    @Query('availability')
    availability?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.doctorService.getDoctors(
      search,
      specialization,
      availability,
      page,
      limit,
    );
  }

  @Get(':id')
  getDoctorById(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.doctorService.getDoctorById(id);
  }
}