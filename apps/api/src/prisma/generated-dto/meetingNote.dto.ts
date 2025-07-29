
import {ApiProperty} from '@nestjs/swagger'


export class MeetingNoteDto {
  id: string ;
title: string ;
content: string ;
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
