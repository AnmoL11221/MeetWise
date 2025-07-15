import { ApiProperty } from '@nestjs/swagger';

export class UpdateActionItemDto {
  description?: string;
  @ApiProperty({
    type: `string`,
    format: `date-time`,
  })
  dueDate?: Date;
}
