import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

import { RecurringAvailability } from '../../availability/entities/recurring-availability.entity';
import { CustomAvailability } from '../../availability/entities/custom-availability.entity';

import { Appointment } from '../../appointment/entities/appointment.entity';

@Entity('doctor_profiles')
export class DoctorProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column()
  specialization: string;

  @Column()
  experience: number;

  @Column()
  qualification: string;

  @Column('decimal')
  consultationFee: number;

  @Column()
  availability: string;

  @Column({
    type: 'text',
  })
  profileDetails: string;

  @OneToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @OneToMany(
    () => RecurringAvailability,
    (availability) => availability.doctorProfile,
  )
  recurringAvailabilities: RecurringAvailability[];

  @OneToMany(
    () => CustomAvailability,
    (availability) => availability.doctorProfile,
  )
  customAvailabilities: CustomAvailability[];

  @OneToMany(
    () => Appointment,
    (appointment) => appointment.doctorProfile,
  )
  appointments: Appointment[];
}