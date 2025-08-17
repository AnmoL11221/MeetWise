
import {ApiProperty,getSchemaPath} from '@nestjs/swagger'




export class CreateActionItemDto {
  description: string;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
dueDate?: Date;
}
