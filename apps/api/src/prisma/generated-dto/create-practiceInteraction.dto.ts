
import {ApiProperty,getSchemaPath} from '@nestjs/swagger'




export class CreatePracticeInteractionDto {
  speaker: string;
message: string;
messageType: string;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
timestamp: Date;
}
