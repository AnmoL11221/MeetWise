import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class BodyCreateMeetingDto {
  @ApiProperty({
    description: 'The title of the meeting',
    example: 'Q4 Strategy Session',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Optional agenda items for the meeting',
    required: false,
    type: 'array',
    example: [{ text: 'Discuss Q4 goals', author: 'Alice' }],
  })
  agendaItems?: any;
}
