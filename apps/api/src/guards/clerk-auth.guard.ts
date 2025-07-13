/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { Request } from 'express';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>(); // <-- Type the request
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      this.logger.warn('Authorization header missing');
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      this.logger.warn('Bearer token missing');
      throw new UnauthorizedException('Bearer token is missing');
    }

    try {
      const claims = await clerkClient.verifyToken(token);
      (request as any).auth = { sub: claims.sub };

      return true;
    } catch (error) {
      this.logger.error('Token verification failed', (error as Error).stack);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
