import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { EmploymentPermission } from 'src/employment/type/employment-permission.enum';
import { NotificationType } from '../type/notification-type.enum';

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  @IsNotEmpty()
  public type: NotificationType;

  @IsUUID()
  @IsOptional()
  public userId?: string;

  @IsUUID()
  @IsOptional()
  public companyId?: string;

  @IsUUID()
  @IsOptional()
  public fromUserId?: string;

  @IsUUID()
  @IsOptional()
  public fromBranchId?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  public message?: string;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  public metadata?: string;

  @IsEnum(EmploymentPermission)
  @IsOptional()
  public minRole?: EmploymentPermission;
}
