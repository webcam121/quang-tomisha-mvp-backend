import { IsArray, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { JobLogAction } from 'src/job-log/type/job-log-action.enum';

export class CreateApplicationLogDto {
  @IsInt()
  @IsOptional()
  public applicationId?: number;

  @IsArray()
  @IsOptional()
  public applicationIds?: number[];

  @IsEnum(JobLogAction)
  public action: JobLogAction;

  @IsString()
  @IsOptional()
  public password?: string;
}
