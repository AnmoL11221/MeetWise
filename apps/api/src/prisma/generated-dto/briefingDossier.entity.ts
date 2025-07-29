
import {Prisma} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'
import {Meeting} from './meeting.entity'


export class BriefingDossier {
  id: string ;
meetingId: string ;
meeting?: Meeting ;
attendeeProfiles: Prisma.JsonValue  | null;
relevantDocuments: Prisma.JsonValue  | null;
marketNews: Prisma.JsonValue  | null;
agendaAnalysis: Prisma.JsonValue  | null;
keyInsights: string  | null;
recommendations: string  | null;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
createdAt: Date ;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
updatedAt: Date ;
}
