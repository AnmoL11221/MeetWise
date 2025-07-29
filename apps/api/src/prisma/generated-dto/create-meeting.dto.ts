
import {Prisma} from '@prisma/client'
import {ApiProperty,getSchemaPath} from '@nestjs/swagger'




export class CreateMeetingDto {
  title: string;
description?: string;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
scheduledAt?: Date;
agendaItems?: Prisma.InputJsonValue;
}
