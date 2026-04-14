
import {Prisma} from '@prisma/client'




export class CreateMeetingSummaryDto {
  summaryText: string;
decisions?: Prisma.InputJsonValue;
actionItems?: Prisma.InputJsonValue;
generatedBy?: string;
}
