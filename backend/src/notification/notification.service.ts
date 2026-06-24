import {
    BadRequestException,
    NotFoundException,
  } from '@nestjs/common';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Notification } from './entities/notification.entity';
import { PatientProfile } from '../patient/entities/patient-profile.entity';

import { NotificationType } from './enums/notification-type.enum';

import { PatientService } from '../patient/patient.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,

    @InjectRepository(PatientProfile)
    private readonly patientRepository: Repository<PatientProfile>,

    private readonly patientService: PatientService,
  ) {}

  async createNotification(
    patientId: string,
    title: string,
    message: string,
    type: NotificationType,
  ) {
    const notification =
      this.notificationRepository.create({
        patientId,
        title,
        message,
        type,
      });

    return this.notificationRepository.save(
      notification,
    );
  }

  async getNotifications(
    userId: string,
  ) {
    const patient =
      await this.patientService.findOne(
        userId,
      );
  
    return this.notificationRepository.find({
      where: {
        patientId: patient.id,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
  async markAsRead(
    notificationId: string,
    userId: string,
  ) {
    const patient =
      await this.patientService.findOne(
        userId,
      );
  
    const notification =
      await this.notificationRepository.findOne({
        where: {
          id: notificationId,
          patientId: patient.id,
        },
      });
  
    if (!notification) {
      throw new NotFoundException(
        'Notification not found',
      );
    }
  
    if (notification.isRead) {
      throw new BadRequestException(
        'Notification already marked as read',
      );
    }
  
    notification.isRead = true;
  
    await this.notificationRepository.save(
      notification,
    );
  
    return {
      message:
        'Notification marked as read',
    };
  }

  async markAllAsRead(
    userId: string,
  ) {
    const patient =
      await this.patientService.findOne(
        userId,
      );
  
    await this.notificationRepository.update(
      {
        patientId: patient.id,
        isRead: false,
      },
      {
        isRead: true,
      },
    );
  
    return {
      message:
        'All notifications marked as read',
    };
  }
  async getUnreadCount(
    userId: string,
  ) {
    const patient =
      await this.patientService.findOne(
        userId,
      );
  
    const count =
      await this.notificationRepository.count({
        where: {
          patientId: patient.id,
          isRead: false,
        },
      });
  
    return {
      count,
    };
  }

}