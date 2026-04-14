
import {Prisma} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'
import {User} from './user.entity'
import {BriefingDossier} from './briefingDossier.entity'
import {MeetingNote} from './meetingNote.entity'
import {SharedResource} from './sharedResource.entity'
import {PracticeSession} from './practiceSession.entity'
import {ActionItem} from './actionItem.entity'
import {MeetingSummary} from './meetingSummary.entity'


export class Meeting {
  id: string ;
title: string ;
description: string  | null;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
scheduledAt: Date  | null;
isPrivate: boolean ;
roomAccess: string ;
agendaItems: Prisma.JsonValue  | null;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
createdAt: Date ;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
updatedAt: Date ;
creatorId: string ;
attendees?: User[] ;
creator?: User ;
briefingDossier?: BriefingDossier  | null;
meetingNotes?: MeetingNote[] ;
sharedResources?: SharedResource[] ;
practiceSessions?: PracticeSession[] ;
actionItems?: ActionItem[] ;
recurrencePattern: string  | null;
@ApiProperty({
  type: `integer`,
  format: `int32`,
})
recurrenceInterval: number  | null;
@ApiProperty({
  type: `string`,
  format: `date-time`,
})
recurrenceEndDate: Date  | null;
parentMeetingId: string  | null;
parentMeeting?: Meeting  | null;
recurringMeetings?: Meeting[] ;
summary?: MeetingSummary  | null;
}
