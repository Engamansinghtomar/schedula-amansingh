import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsBoolean,
  IsInt,
  IsOptional,
} from 'class-validator';

export class CreateDoctorProfileDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  specialization: string;

  @IsNumber()
  @Min(0)
  experience: number;

  @IsString()
  @IsNotEmpty()
  qualification: string;

  @IsNumber()
  @Min(0)
  consultationFee: number;

  @IsString()
  @IsNotEmpty()
  availability: string;

  @IsBoolean()
  @IsOptional()
  allowFutureBooking?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  maxFutureBookingDays?: number;

  @IsString()
  @IsNotEmpty()
  profileDetails: string;
}