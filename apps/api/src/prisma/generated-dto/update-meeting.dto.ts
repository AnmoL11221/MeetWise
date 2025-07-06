
import {Prisma} from '@prisma/client'




export class UpdateMeetingDto {
  title?: string;
agendaItems?: Prisma.InputJsonValue;
}
