
import {Prisma} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'


export class ExternalAttendee {
  id: string ;
email: string ;
name: string ;
company: string  | null;
jobTitle: string  | null;
linkedinProfile: string  | null;
recentActivity: Prisma.JsonValue  | null;
companyNews: Prisma.JsonValue  | null;
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
