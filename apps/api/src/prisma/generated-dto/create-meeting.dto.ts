
import {Prisma} from '@prisma/client'




export class CreateMeetingDto {
  title: string;
agendaItems?: Prisma.InputJsonValue;
}
