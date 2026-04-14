
import {Prisma} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'
import {Meeting} from './meeting.entity'


export class MeetingSummary {
  id: string ;
meetingId: string ;
meeting?: Meeting ;
summaryText: string ;
decisions: Prisma.JsonValue  | null;
actionItems: Prisma.JsonValue  | null;
generatedBy: string  | null;
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
