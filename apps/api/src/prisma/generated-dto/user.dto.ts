import { ApiProperty } from '@nestjs/swagger';
export class UserDto {
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
}
