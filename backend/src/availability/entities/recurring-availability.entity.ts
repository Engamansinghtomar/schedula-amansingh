import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  import { DoctorProfile } from '../../doctor/entities/doctor-profile.entity';
  
  import { DayOfWeek } from '../../common/enums/day-of-week.enum';
  
  @Entity('recurring_availabilities')
  export class RecurringAvailability {
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
      type: 'enum',
      enum: DayOfWeek,
    })
    dayOfWeek: DayOfWeek;
  
    @Column()
    startTime: string;
  
    @Column()
    endTime: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }