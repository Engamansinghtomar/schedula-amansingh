import {
  IsEnum,
  IsNotEmpty,
  Matches,
  IsInt,
  Min,
  IsOptional,
  ValidateIf,
} from 'class-validator';

import { DayOfWeek } from '../../common/enums/day-of-week.enum';

import { SchedulingType } from '../../common/enums/scheduling-type.enum';

export class CreateRecurringAvailabilityDto {
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  startTime: string;

  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  endTime: string;

  @IsEnum(SchedulingType)
  schedulingType: SchedulingType;

  @ValidateIf(
    (o) =>
      o.schedulingType ===
      SchedulingType.STREAM,
  )
  @IsInt()
  @Min(1)
  slotDuration: number;

  @ValidateIf(
    (o) =>
      o.schedulingType ===
      SchedulingType.STREAM,
  )
  @IsOptional()
  @IsInt()
  @Min(0)
  bufferTime?: number;

  @ValidateIf(
    (o) =>
      o.schedulingType ===
      SchedulingType.WAVE,
  )
  @IsInt()
  @Min(1)
  maxCapacity: number;
}