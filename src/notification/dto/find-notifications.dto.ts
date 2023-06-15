import { IsOptional, IsUUID } from 'class-validator';

export class FindNotificationDto {
  @IsUUID()
  @IsOptional()
  public companyId?: string;
}