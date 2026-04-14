import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailDeliveryService } from './email-delivery.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailDeliveryService: EmailDeliveryService,
  ) {}

  async listForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    if (notification.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async createForUser(
    userId: string,
    input: {
      type: string;
      title: string;
      body: string;
      metadata?: unknown;
      email?: string;
    },
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type: input.type,
        title: input.title,
        body: input.body,
        metadata: (input.metadata as any) ?? undefined,
      },
    });

    if (input.email) {
      try {
        await this.emailDeliveryService.sendEmail({
          to: input.email,
          subject: input.title,
          text: input.body,
        });
        await this.prisma.notification.update({
          where: { id: notification.id },
          data: { sentEmailAt: new Date() },
        });
      } catch (error) {
        console.error('Failed to send email notification:', error);
      }
    }

    return notification;
  }
}
