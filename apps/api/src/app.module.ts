import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MeetingsModule } from './meetings/meetings.module';
import { PrismaModule } from 'prisma/prisma.module';
import { WebhooksController } from './webhooks.controller';
import { ClerkModule } from './clerk/clerk.module';
import { ActionItemsModule } from './action-items/action-items.module';

@Module({
  imports: [MeetingsModule, PrismaModule, ClerkModule, ActionItemsModule],
  controllers: [AppController, WebhooksController],
  providers: [AppService],
})
export class AppModule {}
