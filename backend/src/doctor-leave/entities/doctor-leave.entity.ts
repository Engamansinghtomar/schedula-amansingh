import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  import { DoctorProfile } from '../../doctor/entities/doctor-profile.entity';
  
  @Entity('doctor_leaves')
  export class DoctorLeave {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => DoctorProfile, (doctor) => doctor.doctorLeaves, {
      onDelete: 'CASCADE',
    })
    doctorProfile: DoctorProfile;
  
    @Column({
      type: 'date',
    })
    leaveDate: string;
  
    @Column({
      type: 'text',
      nullable: true,
    })
    reason?: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }