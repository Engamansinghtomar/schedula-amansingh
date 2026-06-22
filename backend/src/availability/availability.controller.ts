import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Req,
  UseGuards,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';

import { AvailabilityService } from './availability.service';

import { CreateRecurringAvailabilityDto } from './dto/create-recurring-availability.dto';
import { UpdateRecurringAvailabilityDto } from './dto/update-recurring-availability.dto';
import { CreateCustomAvailabilityDto } from './dto/create-custom-availability.dto';
import { GetDoctorSlotsDto } from './dto/get-doctor-slots.dto';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('doctor/availability')
export class AvailabilityController {
  constructor(
    private readonly availabilityService: AvailabilityService,
  ) {}

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(Role.DOCTOR)
  @Post()
  createRecurringAvailability(
    @Req() req: any,
    @Body()
    createRecurringAvailabilityDto: CreateRecurringAvailabilityDto,
  ) {
    return this.availabilityService.createRecurringAvailability(
      req.user.id,
      createRecurringAvailabilityDto,
    );
  }

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(Role.DOCTOR)
  @Get()
  getRecurringAvailabilities(
    @Req() req: any,
  ) {
    return this.availabilityService.getRecurringAvailabilities(
      req.user.id,
    );
  }

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(Role.DOCTOR)
  @Get('date')
  getAvailabilityByDate(
    @Req() req: any,
    @Query('date')
    date: string,
  ) {
    return this.availabilityService.getAvailabilityByDate(
      req.user.id,
      date,
    );
  }

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(Role.PATIENT)
  @Get(':doctorId/slots')
  getDoctorSlots(
    @Param('doctorId', ParseUUIDPipe)
    doctorId: string,

    @Query()
    query: GetDoctorSlotsDto,
  ) {
    return this.availabilityService.getDoctorSlots(
      doctorId,
      query.date,
      query.duration,
    );
  }

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(Role.DOCTOR)
  @Patch(':id')
  updateRecurringAvailability(
    @Req() req: any,
    @Param('id', ParseUUIDPipe)
    id: string,
    @Body()
    updateRecurringAvailabilityDto: UpdateRecurringAvailabilityDto,
  ) {
    return this.availabilityService.updateRecurringAvailability(
      req.user.id,
      id,
      updateRecurringAvailabilityDto,
    );
  }

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(Role.DOCTOR)
  @Delete(':id')
  deleteRecurringAvailability(
    @Req() req: any,
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.availabilityService.deleteRecurringAvailability(
      req.user.id,
      id,
    );
  }

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(Role.DOCTOR)
  @Post('override')
  createCustomAvailability(
    @Req() req: any,
    @Body()
    createCustomAvailabilityDto: CreateCustomAvailabilityDto,
  ) {
    return this.availabilityService.createCustomAvailability(
      req.user.id,
      createCustomAvailabilityDto,
    );
  }
}