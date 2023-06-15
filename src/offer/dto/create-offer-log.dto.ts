import { IsArray, IsEnum, IsInt, IsOptional, IsUUID } from 'class-validator';
import { JobLogAction } from 'src/job-log/type/job-log-action.enum';

export class CreateOfferLogDto {
  @IsUUID()
  @IsOptional()
  public companyId?: string;

  @IsUUID()
  @IsOptional()
  public agencyId?: string;

  @IsInt()
  @IsOptional()
  public offerId: number;

  @IsArray()
  @IsOptional()
  public offerIds?: number[];

  @IsEnum(JobLogAction)
  public action: JobLogAction;
}
