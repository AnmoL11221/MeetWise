
import {Prisma} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'


export class MeetingTemplateDto {
  id: string ;
title: string ;
description: string  | null;
agendaItems: Prisma.JsonValue  | null;
isPrivate: boolean ;
roomAccess: string ;
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
