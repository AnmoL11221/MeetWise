
import {ApiProperty} from '@nestjs/swagger'


export class PracticeInteractionDto {
  id: string ;
speaker: string ;
message: string ;
messageType: string ;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
timestamp: Date ;
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
