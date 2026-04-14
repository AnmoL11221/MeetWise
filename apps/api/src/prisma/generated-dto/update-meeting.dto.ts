
import {Prisma} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'




export class UpdateMeetingDto {
  title?: string;
description?: string;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
scheduledAt?: Date;
agendaItems?: Prisma.InputJsonValue;
recurrencePattern?: string;
@ApiProperty({
  type: `integer`,
  format: `int32`,
})
recurrenceInterval?: number;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
recurrenceEndDate?: Date;
}
