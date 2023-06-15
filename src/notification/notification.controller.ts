import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { FindNotificationDto } from './dto';
import { Notification } from './notification.entity';
import { NotificationService } from './notification.service';
import { NotificationStatus } from './type/notification-status.enum';

@Controller('notification')
export class NotificationController {
  constructor (private notificationService: NotificationService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  public findMyActiveNotifications(@Req() req: Request, @Query() findNotificationDto: FindNotificationDto): Promise<Notification[]> {
    return this.notificationService.findMyActiveNotifications(req.user.id, findNotificationDto.companyId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  public findById(@Req() req: Request, @Param('id') id: number, @Query() findNotificationDto: FindNotificationDto): Promise<Notification> {
    return this.notificationService.findById(id, req.user.id, findNotificationDto.companyId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  public async setStatus(@Req() req: Request, @Res() res: Response, @Param('id') id: number, @Body('status') status: NotificationStatus): Promise<void> {
    await this.notificationService.setStatus(id, status, req.user.id);
    res.sendStatus(200);
  }
}
