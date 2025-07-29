import { Injectable, NotFoundException } from '@nestjs/common';
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
    // Implementation needed
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findAllForMeeting(_meetingId: string) {
    // Implementation needed
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_id: string, _updateActionItemDto: UpdateActionItemDto) {
    // Implementation needed
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  delete(_id: string) {
    // Implementation needed
    return null;
  }
}
