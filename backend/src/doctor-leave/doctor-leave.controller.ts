import {
    Body,
    Controller,
    Post,
    Req,
    UseGuards,
    Patch,
    Param,
    ParseUUIDPipe,
    Delete,
} from '@nestjs/common';

import { DoctorLeaveService } from './doctor-leave.service';

import { CreateDoctorLeaveDto } from './dto/create-doctor-leave.dto';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

import { UpdateDoctorLeaveDto } from './dto/update-doctor-leave.dto';

@Controller('doctor-leave')
export class DoctorLeaveController {
    constructor(
        private readonly doctorLeaveService: DoctorLeaveService,
    ) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.DOCTOR)
    @Post()
    create(
        @Req() req: any,
        @Body()
        createDoctorLeaveDto: CreateDoctorLeaveDto,
    ) {
        return this.doctorLeaveService.create(
            req.user.id,
            createDoctorLeaveDto,
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.DOCTOR)
    @Patch(':id')
    update(
        @Req() req: any,
        @Param('id', ParseUUIDPipe)
        leaveId: string,
        @Body()
        updateDoctorLeaveDto: UpdateDoctorLeaveDto,
    ) {
        return this.doctorLeaveService.update(
            req.user.id,
            leaveId,
            updateDoctorLeaveDto,
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.DOCTOR)
    @Delete(':id')
    remove(
        @Req() req: any,
        @Param('id', ParseUUIDPipe)
        leaveId: string,
    ) {
        return this.doctorLeaveService.remove(
            req.user.id,
            leaveId,
        );
    }

}