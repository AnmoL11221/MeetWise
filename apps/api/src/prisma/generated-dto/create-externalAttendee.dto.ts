
import {Prisma} from '@prisma/client'




export class CreateExternalAttendeeDto {
  email: string;
name: string;
company?: string;
jobTitle?: string;
linkedinProfile?: string;
recentActivity?: Prisma.InputJsonValue;
companyNews?: Prisma.InputJsonValue;
}
