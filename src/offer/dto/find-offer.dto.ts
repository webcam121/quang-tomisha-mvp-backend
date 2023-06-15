import { IsOptional, IsUUID } from 'class-validator';

export class FindOfferDto {
  @IsUUID()
  @IsOptional()
  public companyId?: string;

  @IsUUID()
  @IsOptional()
  public agencyId?: string;
}
