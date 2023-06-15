import { IsOptional, IsUUID } from 'class-validator';

export class FindMyOffersDto {
  @IsUUID()
  @IsOptional()
  public agencyId?: string;
}