import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateActionItemDto } from './dto/create-action-item.dto';
import { UpdateActionItemDto } from './dto/update-action-item.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ActionItemsService {
  constructor(
    private prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async ensureMeetingMember(meetingId: string, userId: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      select: {
        id: true,
        creatorId: true,
        attendees: {
          select: { id: true },
        },
      },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found.');
    }

    const isMember =
      meeting.creatorId === userId ||
      meeting.attendees.some((attendee) => attendee.id === userId);

    if (!isMember) {
      throw new ForbiddenException('You are not authorized to access this meeting.');
    }

    return meeting;
  }

  async create(createActionItemDto: CreateActionItemDto, userId: string) {
    await this.ensureMeetingMember(createActionItemDto.meetingId, userId);

    const created = await this.prisma.actionItem.create({
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
    if (created.assigneeId) {
      await this.notifyAssignee(created.assigneeId, created.description, created.id);
    }
    return created;
  }

  async findAllForMeeting(meetingId: string, userId: string) {
    await this.ensureMeetingMember(meetingId, userId);

    return this.prisma.actionItem.findMany({
      where: { meetingId },
      include: {
        assignee: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, updateActionItemDto: UpdateActionItemDto, userId: string) {
    const actionItem = await this.prisma.actionItem.findUnique({
      where: { id },
      select: {
        id: true,
        meetingId: true,
      },
    });
    if (!actionItem) {
      throw new NotFoundException('Action item not found.');
    }

    await this.ensureMeetingMember(actionItem.meetingId, userId);

    const updated = await this.prisma.actionItem.update({
      where: { id },
      data: updateActionItemDto,
      include: {
        assignee: true,
        meeting: true,
      },
    });
    if (updated.assigneeId) {
      await this.notifyAssignee(updated.assigneeId, updated.description, updated.id);
    }
    return updated;
  }

  async delete(id: string, userId: string) {
    const actionItem = await this.prisma.actionItem.findUnique({
      where: { id },
      select: {
        id: true,
        meetingId: true,
      },
    });
    if (!actionItem) {
      throw new NotFoundException('Action item not found.');
    }

    await this.ensureMeetingMember(actionItem.meetingId, userId);

    await this.prisma.actionItem.delete({
      where: { id },
    });

    return { id, message: 'Action item deleted successfully' };
  }

  private async notifyAssignee(
    assigneeId: string,
    description: string,
    actionItemId: string,
  ) {
    const assignee = await this.prisma.user.findUnique({
      where: { id: assigneeId },
      select: { email: true },
    });
    if (!assignee) return;

    await this.notificationsService.createForUser(assigneeId, {
      type: 'ACTION_ITEM_ASSIGNED',
      title: 'New action item assigned',
      body: description,
      metadata: { actionItemId },
      email: assignee.email,
    });
  }
}
