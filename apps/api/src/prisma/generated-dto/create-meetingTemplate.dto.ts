
import {Prisma} from '@prisma/client'




export class CreateMeetingTemplateDto {
  title: string;
description?: string;
agendaItems?: Prisma.InputJsonValue;
}
