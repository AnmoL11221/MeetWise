
import {ApiProperty} from '@nestjs/swagger'
import {Meeting} from './meeting.entity'
import {User} from './user.entity'


export class MeetingNote {
  id: string ;
meetingId: string ;
meeting?: Meeting ;
title: string ;
content: string ;
authorId: string ;
author?: User ;
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
