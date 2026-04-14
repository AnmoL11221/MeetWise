import { Controller, Get, Patch, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';
import { ClerkUserService } from '../clerk/clerk-user.service';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(ClerkAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly clerkUserService: ClerkUserService,
  ) {}

  @Get()
  async list(@Req() req: Request) {
    const user = await this.clerkUserService.ensureUserExists(req.auth.sub);
    if (!user) return [];
    return this.notificationsService.listForUser(user.id);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: Request) {
    const user = await this.clerkUserService.ensureUserExists(req.auth.sub);
    if (!user) return null;
    return this.notificationsService.markAsRead(id, user.id);
  }
}
