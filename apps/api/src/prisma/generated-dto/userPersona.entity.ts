
import {ApiProperty} from '@nestjs/swagger'
import {User} from './user.entity'
import {Persona} from './persona.entity'


export class UserPersona {
  id: string ;
userId: string ;
user?: User ;
personaId: string ;
persona?: Persona ;
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
