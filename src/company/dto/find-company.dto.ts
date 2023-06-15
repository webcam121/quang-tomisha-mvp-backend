import { IsUUID, IsOptional, IsString } from 'class-validator';

export class FindCompanyDto {
  @IsUUID()
  @IsOptional()
  public id?: string;

  @IsString()
  @IsOptional()
  public slug?: string;

  @IsUUID()
  @IsOptional()
  public userId?: string;
}