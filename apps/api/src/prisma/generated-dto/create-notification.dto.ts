
import {Prisma} from '@prisma/client'
import {ApiProperty,getSchemaPath} from '@nestjs/swagger'




export class CreateNotificationDto {
  type: string;
title: string;
body: string;
metadata?: Prisma.InputJsonValue;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
sentEmailAt?: Date;
}
