
import {Prisma} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'
import {User} from './user.entity'


export class Notification {
  id: string ;
userId: string ;
user?: User ;
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
