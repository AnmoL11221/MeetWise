
import {Prisma} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'


export class MeetingDto {
  id: string ;
title: string ;
description: string  | null;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
scheduledAt: Date  | null;
isPrivate: boolean ;
roomAccess: string ;
agendaItems: Prisma.JsonValue  | null;
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
recurrencePattern: string  | null;
@ApiProperty({
  type: `integer`,
  format: `int32`,
})
recurrenceInterval: number  | null;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
recurrenceEndDate: Date  | null;
}
