
import {Prisma} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'




export class UpdateNotificationDto {
  type?: string;
title?: string;
body?: string;
metadata?: Prisma.InputJsonValue;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
sentEmailAt?: Date;
}
