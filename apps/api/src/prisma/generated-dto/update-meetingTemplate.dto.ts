
import {Prisma} from '@prisma/client'




export class UpdateMeetingTemplateDto {
  title?: string;
description?: string;
agendaItems?: Prisma.InputJsonValue;
}
