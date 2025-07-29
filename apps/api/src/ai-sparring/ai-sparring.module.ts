import { Module } from '@nestjs/common';
import { AISparringService } from './ai-sparring.service';
import { AISparringController } from './ai-sparring.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [AISparringController],
  providers: [AISparringService, PrismaService],
  exports: [AISparringService],
})
export class AISparringModule {}