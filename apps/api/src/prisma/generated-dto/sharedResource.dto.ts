
import {ApiProperty} from '@nestjs/swagger'


export class SharedResourceDto {
  id: string ;
title: string ;
description: string  | null;
type: string ;
url: string  | null;
content: string  | null;
uploadedBy: string ;
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
