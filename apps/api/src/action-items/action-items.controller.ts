import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, Logger, UseGuards, Req } from '@nestjs/common';
import { ActionItemsService } from './action-items.service';
import { CreateActionItemDto } from './dto/create-action-item.dto';
import { UpdateActionItemDto } from './dto/update-action-item.dto';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';
import { Request } from 'express';
import { ClerkUserService } from '../clerk/clerk-user.service';

@Controller('action-items')
@UseGuards(ClerkAuthGuard)
export class ActionItemsController {
  constructor(
    private readonly actionItemsService: ActionItemsService,
    private readonly clerkUserService: ClerkUserService,
  ) {}
  private readonly logger = new Logger(ActionItemsController.name);

  @Post()
  async create(@Body() createActionItemDto: CreateActionItemDto, @Req() req: Request) {
    const clerkId = req.auth.sub;
    const user = await this.clerkUserService.ensureUserExists(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.actionItemsService.create(createActionItemDto, user.id);
  }

  @Get('meeting/:meetingId')
  async findAllForMeeting(@Param('meetingId') meetingId: string, @Req() req: Request) {
    const clerkId = req.auth.sub;
    const user = await this.clerkUserService.ensureUserExists(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.actionItemsService.findAllForMeeting(meetingId, user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateActionItemDto: UpdateActionItemDto,
    @Req() req: Request,
  ) {
    const clerkId = req.auth.sub;
    const user = await this.clerkUserService.ensureUserExists(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.actionItemsService.update(id, updateActionItemDto, user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    this.logger.log(`Attempting to delete action item with id: ${id}`);
    const clerkId = req.auth.sub;
    const user = await this.clerkUserService.ensureUserExists(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const deleted = await this.actionItemsService.delete(id, user.id);
    if (!deleted) {
      this.logger.warn(`Action item not found for id: ${id}`);
      throw new NotFoundException('Action item not found');
    }
    return { message: 'Deleted', id };
  }
}
