import { Module } from '@nestjs/common';
import { ActionItemsService } from './action-items.service';
import { ActionItemsController } from './action-items.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ActionItemsController],
  providers: [ActionItemsService],
  exports: [ActionItemsService],
})
export class ActionItemsModule {}
