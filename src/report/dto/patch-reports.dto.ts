import { IsArray, IsEnum } from 'class-validator';
import { ReportStatus } from '../type/report-status.enum';

export class PatchReportsDto {
  @IsArray()
  public ids: string[];

  @IsEnum(ReportStatus)
  public status: ReportStatus;
}
