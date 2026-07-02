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

  import { SchedulingType } from '../../common/enums/scheduling-type.enum';
  
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
  

    @Column({
      type: 'enum',
      enum: SchedulingType,
    })
    schedulingType: SchedulingType;
    
    @Column({
      nullable: true,
    })
    slotDuration: number;
    
    @Column({
      default: 0,
    })
    bufferTime: number;
    
    @Column({
      nullable: true,
    })
    maxCapacity: number;

    
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;

    @Column({
      default: false,
    })
    allowFutureBooking: boolean;
    
    @Column({
      type: 'int',
      nullable: true,
    })
    maxFutureBookingDays: number | null;
  }