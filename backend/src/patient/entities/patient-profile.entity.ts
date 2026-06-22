import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
  } from 'typeorm';
  
  import { User } from '../../users/entities/user.entity';
  
  @Entity('patient_profiles')
  export class PatientProfile {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    fullName: string;
  
    @Column()
    age: number;
  
    @Column()
    gender: string;
  
    @Column()
    contactDetails: string;
  
    @Column({
      nullable: true,
      type: 'text',
    })
    healthInfo?: string;
  
    @OneToOne(() => User, {
      onDelete: 'CASCADE',
    })
    @JoinColumn()
    user: User;
  }