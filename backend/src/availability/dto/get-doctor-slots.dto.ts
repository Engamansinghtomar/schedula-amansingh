import {
  IsDateString,
  IsIn,
  IsInt,
} from 'class-validator';

import { Type } from 'class-transformer';

export class GetDoctorSlotsDto {
  @IsDateString()
  date: string;

  @Type(() => Number)
  @IsInt()
  @IsIn([10, 15, 30], {
    message:
      'Duration must be one of: 10, 15, or 30 minutes',
  })
  duration: number;
}