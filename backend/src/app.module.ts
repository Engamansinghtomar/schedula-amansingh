import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';

import { User } from './users/entities/user.entity';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DoctorModule } from './doctor/doctor.module';
import { PatientModule } from './patient/patient.module';
import { AvailabilityModule } from './availability/availability.module';
import { AppointmentModule } from './appointment/appointment.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('DB_HOST');

        return {
          type: 'postgres',

          host,

          port: Number(
            configService.get<string>('DB_PORT'),
          ),

          username: configService.get<string>(
            'DB_USERNAME',
          ),

          password: configService.get<string>(
            'DB_PASSWORD',
          ),

          database: configService.get<string>(
            'DB_NAME',
          ),

          ssl:
            host === 'localhost'
              ? false
              : {
                  rejectUnauthorized: false,
                },

          entities: [User],

          autoLoadEntities: true,

          synchronize: true,
        };
      },
    }),

    AuthModule,
    UsersModule,
    DoctorModule,
    PatientModule,
    AvailabilityModule,
    AppointmentModule,
    NotificationModule,
  ],

  controllers: [AppController],
})
export class AppModule {}