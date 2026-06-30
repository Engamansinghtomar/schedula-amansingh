import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
  } from 'typeorm';
  
  import { DoctorProfile } from '../../doctor/entities/doctor-profile.entity';
  import { PatientProfile } from '../../patient/entities/patient-profile.entity';
  
  import { AppointmentStatus } from '../enums/appointment-status.enum';
  
  @Entity('appointments')
  export class Appointment {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(
      () => DoctorProfile,
      {
        onDelete: 'CASCADE',
      },
    )
    doctorProfile: DoctorProfile;
  
    @ManyToOne(
      () => PatientProfile,
      {
        onDelete: 'CASCADE',
      },
    )
    patientProfile: PatientProfile;
  
    @Column({
      type: 'date',
    })
    date: string;
  
    @Column()
    startTime: string;
  
    @Column()
    endTime: string;

    @Column({
      nullable: true,
    })
    tokenNumber: number;
  
    @Column({
      type: 'enum',
      enum: AppointmentStatus,
      default: AppointmentStatus.BOOKED,
    })
    status: AppointmentStatus;

    @Column({
      default: false,
    })
    reminderSent: boolean;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }