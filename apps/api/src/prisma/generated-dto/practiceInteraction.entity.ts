
import {ApiProperty} from '@nestjs/swagger'
import {PracticeSession} from './practiceSession.entity'
import {Persona} from './persona.entity'


export class PracticeInteraction {
  id: string ;
practiceSessionId: string ;
practiceSession?: PracticeSession ;
speaker: string ;
message: string ;
messageType: string ;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
timestamp: Date ;
personaId: string  | null;
persona?: Persona  | null;
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
