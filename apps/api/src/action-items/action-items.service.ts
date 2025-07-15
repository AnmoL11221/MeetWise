import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateActionItemDto } from './dto/create-action-item.dto';

@Injectable()
export class ActionItemsService {
  constructor(private prisma: PrismaService) {}

  async create(createActionItemDto: CreateActionItemDto) {
    // Check if meeting exists
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: createActionItemDto.meetingId },
    });
    if (!meeting) {
      throw new NotFoundException(
        'Meeting not found. Cannot create action item for non-existent meeting.',
      );
    }
    // Commented out all actionItem references as ActionItem model is removed
    // return this.prisma.actionItem.create({
    //   data: createActionItemDto,
    // });
  }

  findAllForMeeting() {
    // Commented out as ActionItem model is removed
    // return this.prisma.actionItem.findMany({
    //   where: { meetingId },
    // });
  }

  update() {
    // Commented out all actionItem references as ActionItem model is removed
    // return this.prisma.actionItem.update({
    //   where: { id },
    //   data: updateActionItemDto,
    // });
  }

  async delete(id: string) {
    // Log the ID being deleted
    console.log('Service: Attempting to delete action item with id:', id);
    try {
      // Commented out all actionItem references as ActionItem model is removed
      // return await this.prisma.actionItem.delete({ where: { id } });
      return null;
    } catch (error) {
      // If not found, return null
      // Removed hasCodeProperty/error.code logic as ActionItem is gone
      throw error;
    }
  }
}

function hasCodeProperty(error: unknown): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error && typeof (error as any).code === 'string';
}
