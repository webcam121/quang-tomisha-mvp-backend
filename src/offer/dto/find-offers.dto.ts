import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { JobLogAction } from 'src/job-log/type/job-log-action.enum';

export class FindOffersDto {
  @IsUUID()
  @IsOptional()
  public jobId?: string;

  @IsUUID()
  @IsOptional()
  public companyId?: string;

  @IsUUID()
  @IsOptional()
  public agencyId?: string;

  @IsEnum(JobLogAction)
  @IsOptional()
  public status?: JobLogAction;
}
