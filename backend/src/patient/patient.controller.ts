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
  
  @Controller('patient')
  export class PatientController {
    @Get('profile')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.PATIENT)
    getProfile(@Req() req: any) {
      return {
        message: 'Patient profile accessed successfully',
        user: req.user,
      };
    }
  }