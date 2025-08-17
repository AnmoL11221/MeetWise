import { Priority } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ActionItemDto {
  id: string;
  description: string;
  status: string;
  @ApiProperty({
    type: `string`,
    format: `date-time`,
  })
  dueDate: Date | null;
  @ApiProperty({
    enum: Priority,
  })
  priority: Priority;
  @ApiProperty({
    type: `string`,
    format: `date-time`,
  })
  createdAt: Date;
  @ApiProperty({
    type: `string`,
    format: `date-time`,
  })
  updatedAt: Date;
}
