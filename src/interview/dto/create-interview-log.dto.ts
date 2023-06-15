import { IsArray, IsEnum, IsInt, IsOptional } from 'class-validator';
import { JobLogAction } from 'src/job-log/type/job-log-action.enum';

export class CreateInterviewLogDto {
  @IsInt()
  @IsOptional()
  public interviewId: number;

  @IsArray()
  @IsOptional()
  public interviewIds?: number[];

  @IsEnum(JobLogAction)
  public action: JobLogAction;
}
