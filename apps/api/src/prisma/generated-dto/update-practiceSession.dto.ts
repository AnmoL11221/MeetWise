
import {ApiProperty} from '@nestjs/swagger'




export class UpdatePracticeSessionDto {
  title?: string;
description?: string;
userRole?: string;
scenario?: string;
difficulty?: string;
@ApiProperty({
  type: `integer`,
  format: `int32`,
})
duration?: number;
status?: string;
}
