import { IsString, IsInt, IsUUID, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { EmploymentRole } from '../type/employment-role.enum';

export class CreateEmploymentDto {
  @IsInt()
  public notificationId: string;

  @IsUUID()
  public branchId: string;

  @IsEnum(EmploymentRole)
  public role: EmploymentRole;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  public password?: string;
}
