
import {Prisma} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'


export class PersonaDto {
  id: string ;
name: string ;
role: string ;
company: string  | null;
personality: string ;
background: string ;
expertise: string ;
communicationStyle: string ;
typicalQuestions: Prisma.JsonValue  | null;
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
