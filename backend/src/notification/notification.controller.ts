import {
    Controller,
    Get,
    Patch,
    Param,
    UseGuards,
    Req,
    Request,
} from '@nestjs/common';

import { NotificationService } from './notification.service';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PATIENT)
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService,
    ) { }

    @Get()
    getNotifications(
        @Req() req: Request & {
            user: {
                id: string;
            };
        },
    ) {
        return this.notificationService.getNotifications(
            req.user.id,
        );
    }

    @Patch(':id/read')
    markAsRead(
        @Param('id') id: string,
        @Req() req: Request & {
            user: {
                id: string;
            };
        },
    ) {
        return this.notificationService.markAsRead(
            id,
            req.user.id,
        );
    }

    @Patch('read-all')
    markAllAsRead(
        @Req() req: Request & {
            user: {
                id: string;
            };
        },
    ) {
        return this.notificationService.markAllAsRead(
            req.user.id,
        );
    }

    @Get('unread-count')
    getUnreadCount(
        @Req() req: Request & {
            user: {
                id: string;
            };
        },
    ) {
        return this.notificationService.getUnreadCount(
            req.user.id,
        );
    }
}