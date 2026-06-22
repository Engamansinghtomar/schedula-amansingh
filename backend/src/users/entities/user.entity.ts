import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';

import { Role } from '../../common/enums/role.enum';

import { DoctorProfile } from '../../doctor/entities/doctor-profile.entity';
import { PatientProfile } from '../../patient/entities/patient-profile.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
  })
  role: Role;

  @OneToOne(
    () => DoctorProfile,
    (doctorProfile) => doctorProfile.user,
  )
  doctorProfile: DoctorProfile;

  @OneToOne(
    () => PatientProfile,
    (patientProfile) => patientProfile.user,
  )
  patientProfile: PatientProfile;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}