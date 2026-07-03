import {
  IsDateString,
  IsNotEmpty,
  Matches,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateCustomAvailabilityDto {
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  startTime: string;

  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  endTime: string;

  @IsBoolean()
  @IsOptional()
  allowFutureBooking?: boolean;
}