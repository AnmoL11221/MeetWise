import { Module, Global } from '@nestjs/common';
import { ClerkService } from '../clerk/clerk.service';
import { clerkClient } from '@clerk/clerk-sdk-node';

@Global()
@Module({
  providers: [
    {
      provide: 'CLERK_CLIENT',
      useValue: clerkClient,
    },
    ClerkService,
  ],
  exports: ['CLERK_CLIENT', ClerkService],
})
export class ClerkModule {}
