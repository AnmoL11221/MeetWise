
import {Prisma} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'


export class NotificationDto {
  id: string ;
type: string ;
title: string ;
body: string ;
metadata: Prisma.JsonValue  | null;
isRead: boolean ;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
sentEmailAt: Date  | null;
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
