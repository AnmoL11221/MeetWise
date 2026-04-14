import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { EmailDeliveryService } from './email-delivery.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, EmailDeliveryService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
