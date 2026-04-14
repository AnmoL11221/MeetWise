import { Module, Global } from '@nestjs/common';
import { ClerkService } from '../clerk/clerk.service';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { PrismaModule } from '../../prisma/prisma.module';
import { ClerkUserService } from './clerk-user.service';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: 'CLERK_CLIENT',
      useValue: clerkClient,
    },
    ClerkService,
    ClerkUserService,
  ],
  exports: ['CLERK_CLIENT', ClerkService, ClerkUserService],
})
export class ClerkModule {}
