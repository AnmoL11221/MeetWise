/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Headers,
  Req,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/clerk-sdk-node';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';

interface RequestWithRawBody extends Request {
  rawBody: Buffer;
}

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('clerk')
  @HttpCode(HttpStatus.OK)
  async handleClerkWebhook(
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
    @Req() req: RequestWithRawBody,
  ) {
    console.log('--- Clerk Webhook Debug ---');
    console.log('CLERK_WEBHOOK_SECRET prefix:', process.env.CLERK_WEBHOOK_SECRET?.slice(0, 8));
    console.log('Webhook handler called');
    console.log('Headers:', req.headers);
    console.log('Raw body:', req.rawBody);
    const payload = req.rawBody;
    const secret = process.env.CLERK_WEBHOOK_SECRET;

    if (!secret) {
      console.error('CLERK_WEBHOOK_SECRET is not set in environment variables.');
      throw new BadRequestException('Webhook secret not configured.');
    }

    const wh = new Webhook(secret);
    let msg: WebhookEvent;

    try {
      msg = wh.verify(payload, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Webhook signature verification failed:', (err as Error).message);
      throw new BadRequestException('Webhook verification failed');
    }

    const { type: eventType, data } = msg;
    console.log(`Received Clerk webhook event: ${eventType}`);
    try {
      switch (eventType) {
        case 'user.created':
          await this.prisma.user.upsert({
            where: { email: data.email_addresses[0].email_address },
            update: {
              clerkId: data.id,
              name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'New User',
            },
            create: {
              id: data.id,
              clerkId: data.id,
              email: data.email_addresses[0].email_address,
              name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'New User',
            },
          });
          console.log(`User ${data.id} successfully synced.`);
          break;

        case 'user.updated':
          await this.prisma.user.update({
            where: { id: data.id },
            data: {
              email: data.email_addresses[0].email_address,
              name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Updated User',
            },
          });
          console.log(`User ${data.id} successfully updated.`);
          break;

        case 'user.deleted':
          if (data.deleted) {
            await this.prisma.user.delete({
              where: { id: data.id },
            });
            console.log(`User ${data.id} successfully deleted.`);
          }
          break;
      }
    } catch (error) {
      console.error(`Failed to process webhook event ${eventType} for user ${data.id}:`, error);
    }

    return { status: 'success' };
  }
}
