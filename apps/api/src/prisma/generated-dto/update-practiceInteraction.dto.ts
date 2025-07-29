
import {ApiProperty} from '@nestjs/swagger'




export class UpdatePracticeInteractionDto {
  speaker?: string;
message?: string;
messageType?: string;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
timestamp?: Date;
}
