import {
    Controller,
    Get,
    Req,
    UseGuards,
  } from '@nestjs/common';
  
  import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
  import { RolesGuard } from '../common/guards/roles.guard';
  
  import { Roles } from '../common/decorators/roles.decorator';
  import { Role } from '../common/enums/role.enum';
  
  @Controller('doctor')
  export class DoctorController {
    @Get('profile')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.DOCTOR)
    getProfile(@Req() req: any) {
      return {
        message: 'Doctor profile accessed successfully',
        user: req.user,
      };
    }
  }