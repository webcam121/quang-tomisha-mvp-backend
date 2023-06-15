import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { JobLogAction } from 'src/job-log/type/job-log-action.enum';

export class FindInterviewsDto {
  @IsUUID()
  @IsOptional()
  public jobId?: string;

  @IsUUID()
  public companyId: string;

  @IsEnum(JobLogAction)
  @IsOptional()
  public status?: JobLogAction;
}