import { ApiProperty } from '@nestjs/swagger';
import { Meeting } from './meeting.entity';
export class User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
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
  meetings?: Meeting[];
}
