/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from '../prisma/generated-dto/create-meeting.dto';
import { UpdateMeetingDto } from '../prisma/generated-dto/update-meeting.dto';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';
import { Request } from 'express';
import { InviteUserDto } from './dto/invite-user.dto';

@Controller('meetings')
@UseGuards(ClerkAuthGuard)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  create(@Body() createMeetingDto: CreateMeetingDto, @Req() req: Request) {
    const creatorId = req.auth.sub;
    return this.meetingsService.create(createMeetingDto, creatorId);
  }

  @Get()
  findAllForUser(@Req() req: Request) {
    const userId = req.auth.sub;
    return this.meetingsService.findAllForUser(userId);
  }

  @Post(':id/invite')
  inviteUser(
    @Param('id') meetingId: string,
    @Body() inviteUserDto: InviteUserDto,
  ) {
    return this.meetingsService.inviteUser(meetingId, inviteUserDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.meetingsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMeetingDto: UpdateMeetingDto) {
    return this.meetingsService.update(id, updateMeetingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.meetingsService.remove(id);
  }
}
