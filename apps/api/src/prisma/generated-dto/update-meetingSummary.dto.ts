
import {Prisma} from '@prisma/client'




export class UpdateMeetingSummaryDto {
  summaryText?: string;
decisions?: Prisma.InputJsonValue;
actionItems?: Prisma.InputJsonValue;
generatedBy?: string;
}
