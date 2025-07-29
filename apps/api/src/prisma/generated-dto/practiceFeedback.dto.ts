
import {Prisma} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'


export class PracticeFeedbackDto {
  id: string ;
type: string ;
category: string ;
@ApiProperty({
  type: `number`,
  format: `float`,
})
score: number  | null;
feedback: string ;
suggestions: Prisma.JsonValue  | null;
audioUrl: string  | null;
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
