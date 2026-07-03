import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { DoctorLeave } from './entities/doctor-leave.entity';
import { Appointment } from '../appointment/entities/appointment.entity';

import { DoctorService } from '../doctor/doctor.service';

import { CreateDoctorLeaveDto } from './dto/create-doctor-leave.dto';

import { AppointmentStatus } from '../appointment/enums/appointment-status.enum';

import { UpdateDoctorLeaveDto } from './dto/update-doctor-leave.dto';

@Injectable()
export class DoctorLeaveService {
    constructor(
        @InjectRepository(DoctorLeave)
        private readonly doctorLeaveRepository: Repository<DoctorLeave>,

        @InjectRepository(Appointment)
        private readonly appointmentRepository: Repository<Appointment>,

        private readonly doctorService: DoctorService,
    ) { }

    async create(
        userId: string,
        createDoctorLeaveDto: CreateDoctorLeaveDto,
    ) {
        const doctor =
            await this.doctorService.findOne(userId);

        if (!doctor) {
            throw new NotFoundException(
                'Doctor profile not found',
            );
        }

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const leaveDate = new Date(
            createDoctorLeaveDto.leaveDate,
        );

        leaveDate.setHours(0, 0, 0, 0);

        if (leaveDate < today) {
            throw new ConflictException(
                'Cannot apply leave for a past date',
            );
        }
        const existingLeave =
            await this.doctorLeaveRepository.findOne({
                where: {
                    doctorProfile: {
                        id: doctor.id,
                    },
                    leaveDate:
                        createDoctorLeaveDto.leaveDate,
                },
            });

        if (existingLeave) {
            throw new ConflictException(
                'Leave already exists for this date',
            );
        }
        const existingAppointment =
            await this.appointmentRepository.findOne({
                where: {
                    doctorProfile: {
                        id: doctor.id,
                    },
                    date: createDoctorLeaveDto.leaveDate,
                    status: AppointmentStatus.BOOKED,
                },
            });

        if (existingAppointment) {
            throw new ConflictException(
                `Cannot apply leave.
Appointments are already scheduled on this date.
Please cancel or reschedule existing appointments first.`,
            );
        }
        const leave = this.doctorLeaveRepository.create({
            ...createDoctorLeaveDto,
            doctorProfile: {
                id: doctor.id,
            } as any,
        });

        return this.doctorLeaveRepository.save(
            leave,
        );
    }

    async update(
        userId: string,
        leaveId: string,
        updateDoctorLeaveDto: UpdateDoctorLeaveDto,
    ) {
        const doctor =
            await this.doctorService.findOne(userId);

        if (!doctor) {
            throw new NotFoundException(
                'Doctor profile not found',
            );
        }
        if (updateDoctorLeaveDto.leaveDate) {
            const today = new Date();

            today.setHours(0, 0, 0, 0);

            const leaveDate = new Date(
                updateDoctorLeaveDto.leaveDate,
            );

            leaveDate.setHours(0, 0, 0, 0);

            if (leaveDate < today) {
                throw new ConflictException(
                    'Cannot apply leave for a past date',
                );
            }
        }
        const leave =
            await this.doctorLeaveRepository.findOne({
                where: {
                    id: leaveId,
                },
                relations: {
                    doctorProfile: true,
                },
            });

        if (!leave) {
            throw new NotFoundException(
                'Leave not found',
            );
        }
        if (leave.doctorProfile.id !== doctor.id) {
            throw new ConflictException(
                'Unauthorized access',
            );
        }

        if (updateDoctorLeaveDto.leaveDate) {
            const existingLeave =
                await this.doctorLeaveRepository.findOne({
                    where: {
                        doctorProfile: {
                            id: doctor.id,
                        },
                        leaveDate:
                            updateDoctorLeaveDto.leaveDate,
                    },
                });

            if (
                existingLeave &&
                existingLeave.id !== leave.id
            ) {
                throw new ConflictException(
                    'Leave already exists for this date',
                );
            }
        }

        if (updateDoctorLeaveDto.leaveDate) {
            const existingAppointment =
                await this.appointmentRepository.findOne({
                    where: {
                        doctorProfile: {
                            id: doctor.id,
                        },
                        date: updateDoctorLeaveDto.leaveDate,
                        status: AppointmentStatus.BOOKED,
                    },
                });

            if (existingAppointment) {
                throw new ConflictException(
                    `Cannot apply leave.
          
          Appointments are already scheduled on this date.
          Please cancel or reschedule existing appointments first.`,
                );
            }
        }

        Object.assign(
            leave,
            updateDoctorLeaveDto,
        );

        return this.doctorLeaveRepository.save(
            leave,
        );
    }

    async remove(
        userId: string,
        leaveId: string,
    ) {
        const doctor =
            await this.doctorService.findOne(userId);

        if (!doctor) {
            throw new NotFoundException(
                'Doctor profile not found',
            );
        }

        const leave =
            await this.doctorLeaveRepository.findOne({
                where: {
                    id: leaveId,
                },
                relations: {
                    doctorProfile: true,
                },
            });

        if (!leave) {
            throw new NotFoundException(
                'Leave not found',
            );
        }
        if (leave.doctorProfile.id !== doctor.id) {
            throw new ConflictException(
                'Unauthorized access',
            );
        }

        await this.doctorLeaveRepository.remove(
            leave,
        );

        return {
            message:
                'Leave deleted successfully',
        };

    }
}
