import { IsOptional, IsUUID } from 'class-validator';

export class FindInterviewDto {
  @IsUUID()
  @IsOptional()
  public companyId?: string;
}
