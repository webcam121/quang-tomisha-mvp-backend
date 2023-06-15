import { IsArray, IsEnum } from 'class-validator';
import { SupportStatus } from '../type/support-status.enum';

export class PatchSupportsDto {
  @IsArray()
  public ids: string[];

  @IsEnum(SupportStatus)
  public status: SupportStatus;
}
