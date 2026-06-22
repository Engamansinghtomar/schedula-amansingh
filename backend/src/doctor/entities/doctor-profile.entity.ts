import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
  } from 'typeorm';
  
  import { User } from '../../users/entities/user.entity';
  
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
  }