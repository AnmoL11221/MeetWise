
import {Prisma} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'
import {PracticeInteraction} from './practiceInteraction.entity'
import {UserPersona} from './userPersona.entity'


export class Persona {
  id: string ;
name: string ;
role: string ;
company: string  | null;
personality: string ;
background: string ;
expertise: string ;
communicationStyle: string ;
typicalQuestions: Prisma.JsonValue  | null;
interactions?: PracticeInteraction[] ;
userPersonas?: UserPersona[] ;
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
