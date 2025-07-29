
import {Prisma} from '@prisma/client'




export class UpdatePersonaDto {
  name?: string;
role?: string;
company?: string;
personality?: string;
background?: string;
expertise?: string;
communicationStyle?: string;
typicalQuestions?: Prisma.InputJsonValue;
}
