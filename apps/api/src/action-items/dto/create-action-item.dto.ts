import { IsOptional, IsString } from 'class-validator';

export class CreateActionItemDto {
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  dueDate?: Date;

  @IsOptional()
  @IsString()
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';

  @IsString()
  meetingId: string;

  @IsOptional()
  @IsString()
  assigneeId?: string;
}
