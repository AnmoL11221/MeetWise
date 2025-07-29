
import {Prisma} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'




export class UpdatePracticeFeedbackDto {
  type?: string;
category?: string;
@ApiProperty({
  type: `number`,
  format: `float`,
})
score?: number;
feedback?: string;
suggestions?: Prisma.InputJsonValue;
audioUrl?: string;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
timestamp?: Date;
}
