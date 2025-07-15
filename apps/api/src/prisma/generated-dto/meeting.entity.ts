import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
export class Meeting {
  id: string;
  title: string;
  agendaItems: Prisma.JsonValue | null;
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
  creatorId: string;
  attendees?: User[];
}
