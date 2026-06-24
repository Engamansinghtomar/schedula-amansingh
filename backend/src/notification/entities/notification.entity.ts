import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  
  import { PatientProfile } from '../../patient/entities/patient-profile.entity';
  import { NotificationType } from '../enums/notification-type.enum';
  
  @Entity('notifications')
  export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    patientId: string;
  
    @ManyToOne(() => PatientProfile, {
      onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'patientId' })
    patient: PatientProfile;
  
    @Column()
    title: string;
  
    @Column('text')
    message: string;
  
    @Column({
      type: 'enum',
      enum: NotificationType,
    })
    type: NotificationType;
  
    @Column({
      default: false,
    })
    isRead: boolean;
  
    @CreateDateColumn()
    createdAt: Date;
  }