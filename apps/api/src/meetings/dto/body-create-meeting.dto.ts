import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsDateString, IsIn } from 'class-validator';

export class BodyCreateMeetingDto {
  @ApiProperty({
    description: 'The title of the meeting',
    example: 'Q4 Strategy Session',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Meeting description and details',
    required: false,
    example: 'Quarterly strategy planning session to discuss Q4 goals and objectives.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'When the meeting is scheduled for',
    required: false,
    example: '2024-01-15T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiProperty({
    description: 'Whether the meeting is private',
    required: false,
    default: true,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @ApiProperty({
    description: 'Room access control level',
    required: false,
    default: 'INVITE_ONLY',
    enum: ['INVITE_ONLY', 'PUBLIC', 'RESTRICTED'],
    example: 'INVITE_ONLY',
  })
  @IsOptional()
  @IsIn(['INVITE_ONLY', 'PUBLIC', 'RESTRICTED'])
  roomAccess?: 'INVITE_ONLY' | 'PUBLIC' | 'RESTRICTED';

  @ApiProperty({
    description: 'Optional agenda items for the meeting',
    required: false,
    type: 'array',
    example: [{ text: 'Discuss Q4 goals', author: 'Alice' }],
  })
  @IsOptional()
  agendaItems?: any;
}
