import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { JobLogAction } from '../type/job-log-action.enum';

export class CreateJobLogDto {
  @IsInt()
  @IsOptional()
  public applicationId?: number;

  @IsInt()
  @IsOptional()
  public interviewId?: number;

  @IsInt()
  @IsOptional()
  public offerId?: number;

  @IsEnum(JobLogAction)
  public action: JobLogAction;
}
