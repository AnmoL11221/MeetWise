import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MeetingsModule } from '../meetings/meetings.module';
import { ActionItemsModule } from '../action-items/action-items.module';
import { ClerkModule } from '../clerk/clerk.module';
import { BriefingDossierModule } from '../briefing-dossier/briefing-dossier.module';

@Module({
  imports: [
    PrismaModule,
    MeetingsModule,
    ActionItemsModule,
    ClerkModule,
    BriefingDossierModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
