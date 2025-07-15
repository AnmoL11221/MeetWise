import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, Logger } from '@nestjs/common';
import { ActionItemsService } from './action-items.service';
import { CreateActionItemDto } from './dto/create-action-item.dto';
import { UpdateActionItemDto } from './dto/update-action-item.dto';

@Controller('action-items')
export class ActionItemsController {
  constructor(private readonly actionItemsService: ActionItemsService) {}
  private readonly logger = new Logger(ActionItemsController.name);

  @Post()
  create(@Body() createActionItemDto: CreateActionItemDto) {
    return this.actionItemsService.create(createActionItemDto);
  }

  // GET /action-items/meeting/:meetingId
  @Get('meeting/:meetingId')
  findAllForMeeting(@Param('meetingId') meetingId: string) {
    return this.actionItemsService.findAllForMeeting(meetingId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateActionItemDto: UpdateActionItemDto,
  ) {
    return this.actionItemsService.update(id, updateActionItemDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    this.logger.log(`Attempting to delete action item with id: ${id}`);
    const deleted = await this.actionItemsService.delete(id);
    if (!deleted) {
      this.logger.warn(`Action item not found for id: ${id}`);
      throw new NotFoundException('Action item not found');
    }
    return { message: 'Deleted', id };
  }
}
