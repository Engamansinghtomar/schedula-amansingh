import { PartialType } from '@nestjs/mapped-types';

import { CreateDoctorLeaveDto } from './create-doctor-leave.dto';

export class UpdateDoctorLeaveDto extends PartialType(
  CreateDoctorLeaveDto,
) {}