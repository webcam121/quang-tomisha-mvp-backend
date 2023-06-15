import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateInterviewDto {
  @IsInt()
  public applicationId: number;

  @IsUUID()
  public companyId: string;

  @IsUUID()
  public branchId: string;

  @IsInt()
  public staffId: number;

  @Type(() => Date)
  @IsDate()
  public startAt: Date;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  public message?: string;
}
