import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, Logger, UseGuards, Req } from '@nestjs/common';
import { ActionItemsService } from './action-items.service';
import { CreateActionItemDto } from './dto/create-action-item.dto';
import { UpdateActionItemDto } from './dto/update-action-item.dto';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('action-items')
@UseGuards(ClerkAuthGuard)
export class ActionItemsController {
  constructor(
    private readonly actionItemsService: ActionItemsService,
    private readonly prisma: PrismaService,
  ) {}
  private readonly logger = new Logger(ActionItemsController.name);

  private async ensureUserExists(clerkId: string) {
    let user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      try {
        const { clerkClient } = await import('@clerk/clerk-sdk-node');
        const clerkUser = await clerkClient.users.getUser(clerkId);
        if (clerkUser && clerkUser.emailAddresses.length > 0) {
          user = await this.prisma.user.create({
            data: {
              clerkId: clerkId,
              email: clerkUser.emailAddresses[0].emailAddress,
              name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'New User',
            },
          });
        }
      } catch (error) {
        console.error('Failed to create user from Clerk:', error);
        throw new Error('User not found and could not be created');
      }
    }
    return user;
  }

  @Post()
  async create(@Body() createActionItemDto: CreateActionItemDto, @Req() req: Request) {
    const clerkId = req.auth.sub;
    const user = await this.ensureUserExists(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.actionItemsService.create(createActionItemDto);
  }

  @Get('meeting/:meetingId')
  async findAllForMeeting(@Param('meetingId') meetingId: string, @Req() req: Request) {
    const clerkId = req.auth.sub;
    const user = await this.ensureUserExists(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.actionItemsService.findAllForMeeting(meetingId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateActionItemDto: UpdateActionItemDto,
    @Req() req: Request,
  ) {
    const clerkId = req.auth.sub;
    const user = await this.ensureUserExists(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.actionItemsService.update(id, updateActionItemDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    this.logger.log(`Attempting to delete action item with id: ${id}`);
    const clerkId = req.auth.sub;
    const user = await this.ensureUserExists(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const deleted = await this.actionItemsService.delete(id);
    if (!deleted) {
      this.logger.warn(`Action item not found for id: ${id}`);
      throw new NotFoundException('Action item not found');
    }
    return { message: 'Deleted', id };
  }
}
