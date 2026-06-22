import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { AppointmentService } from './appointment.service';

import { BookAppointmentDto } from './dto/book-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('appointment')
export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
  ) {}

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(Role.PATIENT)
  @Post()
  bookAppointment(
    @Req() req: any,
    @Body()
    dto: BookAppointmentDto,
  ) {
    return this.appointmentService.bookAppointment(
      req.user.id,
      dto.doctorId,
      dto.date,
      dto.startTime,
      dto.endTime,
    );
  }

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(Role.PATIENT)
  @Get('my')
  getMyAppointments(
    @Req() req: any,
  ) {
    return this.appointmentService.getMyAppointments(
      req.user.id,
    );
  }

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(Role.DOCTOR)
  @Get('doctor')
  getDoctorAppointments(
    @Req() req: any,
  ) {
    return this.appointmentService.getDoctorAppointments(
      req.user.id,
    );
  }

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(Role.PATIENT)
  @Patch(':id/cancel')
  cancelAppointment(
    @Req() req: any,
    @Param('id', ParseUUIDPipe)
    appointmentId: string,
  ) {
    return this.appointmentService.cancelAppointment(
      req.user.id,
      appointmentId,
    );
  }

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(Role.PATIENT)
  @Patch(':id/reschedule')
  rescheduleAppointment(
    @Req() req: any,
    @Param('id', ParseUUIDPipe)
    appointmentId: string,
    @Body()
    dto: RescheduleAppointmentDto,
  ) {
    return this.appointmentService.rescheduleAppointment(
      req.user.id,
      appointmentId,
      dto.date,
      dto.startTime,
      dto.endTime,
    );
  }
}