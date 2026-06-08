import {
    IsString,
    IsNotEmpty,
    IsNumber,
    Min,
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
  
    @IsString()
    @IsNotEmpty()
    profileDetails: string;
  }