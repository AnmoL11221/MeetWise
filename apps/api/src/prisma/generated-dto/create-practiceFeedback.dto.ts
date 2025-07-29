
import {Prisma} from '@prisma/client'
import {ApiProperty,getSchemaPath} from '@nestjs/swagger'




export class CreatePracticeFeedbackDto {
  type: string;
category: string;
@ApiProperty({
  type: `number`,
  format: `float`,
})
score?: number;
feedback: string;
suggestions?: Prisma.InputJsonValue;
audioUrl?: string;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
timestamp: Date;
}
