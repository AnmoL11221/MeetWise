
import {ApiProperty} from '@nestjs/swagger'
import {Meeting} from './meeting.entity'
import {User} from './user.entity'
import {PracticeFeedback} from './practiceFeedback.entity'
import {PracticeInteraction} from './practiceInteraction.entity'


export class PracticeSession {
  id: string ;
meetingId: string ;
meeting?: Meeting ;
userId: string ;
user?: User ;
title: string ;
description: string  | null;
userRole: string ;
scenario: string ;
difficulty: string ;
@ApiProperty({
  type: `integer`,
  format: `int32`,
})
duration: number ;
status: string ;
feedback?: PracticeFeedback[] ;
interactions?: PracticeInteraction[] ;
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
