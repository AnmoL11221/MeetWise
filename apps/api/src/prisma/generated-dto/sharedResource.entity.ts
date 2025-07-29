
import {ApiProperty} from '@nestjs/swagger'
import {Meeting} from './meeting.entity'


export class SharedResource {
  id: string ;
meetingId: string ;
meeting?: Meeting ;
title: string ;
description: string  | null;
type: string ;
url: string  | null;
content: string  | null;
uploadedBy: string ;
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
