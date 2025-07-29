import { Module } from '@nestjs/common';
import { BriefingDossierService } from './briefing-dossier.service';
import { BriefingDossierController } from './briefing-dossier.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [BriefingDossierController],
  providers: [BriefingDossierService, PrismaService],
  exports: [BriefingDossierService],
})
export class BriefingDossierModule {}