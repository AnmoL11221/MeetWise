
import {ApiProperty} from '@nestjs/swagger'


export class PracticeSessionDto {
  id: string ;
title: string ;
description: string  | null;
userRole: string ;
scenario: string ;
difficulty: string ;
@ApiProperty({
  type: `integer`,
  format: `int32`,
})
duration: number ;
status: string ;
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
