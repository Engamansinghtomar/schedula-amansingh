import {
    IsString,
    Matches,
  } from 'class-validator';
  
  export class RescheduleAppointmentDto {
    @IsString()
    date: string;
  
    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    startTime: string;
  
    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    endTime: string;
  }