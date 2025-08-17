
import {Priority} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'
import {Meeting} from './meeting.entity'
import {User} from './user.entity'


export class ActionItem {
  id: string ;
description: string ;
status: string ;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
dueDate: Date  | null;
@ApiProperty({
  enum: Priority,
})
priority: Priority ;
meetingId: string ;
meeting?: Meeting ;
assigneeId: string  | null;
assignee?: User  | null;
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
