import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateActionItemDto } from './dto/create-action-item.dto';
import { UpdateActionItemDto } from './dto/update-action-item.dto';

@Injectable()
export class ActionItemsService {
  constructor(private prisma: PrismaService) {}

  async create(createActionItemDto: CreateActionItemDto) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: createActionItemDto.meetingId },
    });
    if (!meeting) {
      throw new NotFoundException(
        'Meeting not found. Cannot create action item for non-existent meeting.',
      );
    }

    return this.prisma.actionItem.create({
      data: {
        description: createActionItemDto.description,
        status: createActionItemDto.status || 'TODO',
        dueDate: createActionItemDto.dueDate,
        priority: createActionItemDto.priority || 'MEDIUM',
        meetingId: createActionItemDto.meetingId,
        assigneeId: createActionItemDto.assigneeId,
      },
      include: {
        assignee: true,
        meeting: true,
      },
    });
  }

  async findAllForMeeting(meetingId: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
    });
    if (!meeting) {
      throw new NotFoundException('Meeting not found.');
    }

    return this.prisma.actionItem.findMany({
      where: { meetingId },
      include: {
        assignee: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, updateActionItemDto: UpdateActionItemDto) {
    const actionItem = await this.prisma.actionItem.findUnique({
      where: { id },
    });
    if (!actionItem) {
      throw new NotFoundException('Action item not found.');
    }

    return this.prisma.actionItem.update({
      where: { id },
      data: updateActionItemDto,
      include: {
        assignee: true,
        meeting: true,
      },
    });
  }

  async delete(id: string) {
    const actionItem = await this.prisma.actionItem.findUnique({
      where: { id },
    });
    if (!actionItem) {
      throw new NotFoundException('Action item not found.');
    }

    await this.prisma.actionItem.delete({
      where: { id },
    });

    return { id, message: 'Action item deleted successfully' };
  }
}
