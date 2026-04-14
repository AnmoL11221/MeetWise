
import {Prisma} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'
import {User} from './user.entity'


export class MeetingTemplate {
  id: string ;
title: string ;
description: string  | null;
agendaItems: Prisma.JsonValue  | null;
isPrivate: boolean ;
roomAccess: string ;
creatorId: string ;
creator?: User ;
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
