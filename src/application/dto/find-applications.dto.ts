import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { JobLogAction } from 'src/job-log/type/job-log-action.enum';

export class FindApplicationsDto {
  @IsUUID()
  @IsNotEmpty()
  public jobId: string;

  @IsUUID()
  @IsNotEmpty()
  public companyId: string;

  @Type(() => Number)
  @IsEnum(JobLogAction)
  @IsOptional()
  public status?: JobLogAction;
}