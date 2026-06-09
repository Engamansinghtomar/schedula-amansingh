import {
    IsString,
    IsNotEmpty,
    IsNumber,
    Min,
    IsOptional,
  } from 'class-validator';
  
  export class CreatePatientProfileDto {
    @IsString()
    @IsNotEmpty()
    fullName: string;
  
    @IsNumber()
    @Min(0)
    age: number;
  
    @IsString()
    @IsNotEmpty()
    gender: string;
  
    @IsString()
    @IsNotEmpty()
    contactDetails: string;
  
    @IsOptional()
    @IsString()
    healthInfo?: string;
  }