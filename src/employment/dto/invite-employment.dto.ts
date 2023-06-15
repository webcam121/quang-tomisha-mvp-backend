import { IsUUID, IsEnum, IsString, MaxLength, IsOptional, IsEmail } from 'class-validator';
import { EmploymentRole } from '../type/employment-role.enum';

export class InviteEmploymentDto {
  @IsEmail()
  public userEmail: string;

  @IsEnum(EmploymentRole)
  public role: EmploymentRole;

  @IsUUID()
  public branchId: string;

  @IsUUID()
  public companyId: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  public message?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  public password?: string;
}
