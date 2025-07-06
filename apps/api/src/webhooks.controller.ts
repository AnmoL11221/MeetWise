/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Post,
  Headers,
  Req,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/clerk-sdk-node';
import { PrismaService } from '../prisma/prisma.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly prisma: PrismaService) {}
  @Post('clerk')
  async handleClerkWebhook(
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
    @Body() body: any,
  ) {
    const payload = JSON.stringify(body);
    const secret = process.env.CLERK_WEBHOOK_SECRET;

    if (!secret) {
      throw new Error('CLERK_WEBHOOK_SECRET is not set in .env');
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
      console.error('Webhook verification failed:', err);
      throw new BadRequestException('Webhook verification failed');
    }

    const eventType = msg.type;
    console.log(`Received Clerk webhook event: ${eventType}`);

    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name } = msg.data;

      try {
        await this.prisma.user.create({
          data: {
            clerkId: id as string,
            email: email_addresses[0].email_address,
            name: `${first_name || ''} ${last_name || ''}`.trim(),
          },
        });
        console.log(`User ${id} successfully created in the database.`);
      } catch (error) {
        console.error('Failed to create user in database:', error);
      }
    }

    return { status: 'success' };
  }
}
