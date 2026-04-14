import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ClerkUserService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureUserExists(clerkId: string) {
    let user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (user) {
      return user;
    }

    try {
      const { clerkClient } = await import('@clerk/clerk-sdk-node');
      const clerkUser = await clerkClient.users.getUser(clerkId);

      if (clerkUser && clerkUser.emailAddresses.length > 0) {
        user = await this.prisma.user.create({
          data: {
            clerkId,
            email: clerkUser.emailAddresses[0].emailAddress,
            name:
              `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() ||
              'New User',
          },
        });
      }
    } catch (error) {
      console.error('Failed to create user from Clerk:', error);
      throw new InternalServerErrorException(
        'User not found and could not be created',
      );
    }

    return user;
  }
}
