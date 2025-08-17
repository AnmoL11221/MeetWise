
import {ApiProperty} from '@nestjs/swagger'
import {Meeting} from './meeting.entity'
import {PracticeSession} from './practiceSession.entity'
import {UserPersona} from './userPersona.entity'
import {MeetingNote} from './meetingNote.entity'
import {ActionItem} from './actionItem.entity'


export class User {
  id: string ;
clerkId: string ;
email: string ;
name: string  | null;
linkedinProfile: string  | null;
company: string  | null;
jobTitle: string  | null;
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
meetings?: Meeting[] ;
createdMeetings?: Meeting[] ;
practiceSessions?: PracticeSession[] ;
userPersonas?: UserPersona[] ;
meetingNotes?: MeetingNote[] ;
assignedActionItems?: ActionItem[] ;
}
