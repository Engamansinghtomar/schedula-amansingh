import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  import { DoctorProfile } from '../../doctor/entities/doctor-profile.entity';
  
  @Entity('custom_availabilities')
  export class CustomAvailability {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(
      () => DoctorProfile,
      {
        onDelete: 'CASCADE',
      },
    )
    doctorProfile: DoctorProfile;
  
    @Column({
      type: 'date',
    })
    date: string;
  
    @Column()
    startTime: string;
  
    @Column()
    endTime: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }