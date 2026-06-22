import {
    IsEnum,
    IsNotEmpty,
    Matches,
  } from 'class-validator';
  
  import { DayOfWeek } from '../../common/enums/day-of-week.enum';
  
  export class UpdateRecurringAvailabilityDto {
    @IsEnum(DayOfWeek)
    dayOfWeek: DayOfWeek;
  
    @IsNotEmpty()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    startTime: string;
  
    @IsNotEmpty()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    endTime: string;
  }