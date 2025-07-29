
import {Prisma} from '@prisma/client'




export class CreateBriefingDossierDto {
  attendeeProfiles?: Prisma.InputJsonValue;
relevantDocuments?: Prisma.InputJsonValue;
marketNews?: Prisma.InputJsonValue;
agendaAnalysis?: Prisma.InputJsonValue;
keyInsights?: string;
recommendations?: string;
}
