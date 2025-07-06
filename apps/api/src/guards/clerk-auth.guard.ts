import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { Request } from 'express';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing.');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const claims = await clerkClient.verifyToken(token);
      request.auth = claims;

      return true;
    } catch (error) {
      // Log the actual error for better debugging on the server
      console.error('Clerk token verification failed:', error);
      throw new UnauthorizedException('Invalid or expired token.');
    }
  }
}
