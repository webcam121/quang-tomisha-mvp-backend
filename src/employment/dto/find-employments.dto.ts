import { IsUUID, IsOptional, IsEnum } from 'class-validator';
import { EmploymentRole } from '../type/employment-role.enum';

export class FindEmploymentsDto {
  @IsUUID()
  @IsOptional()
  public companyId?: string;

  @IsUUID()
  @IsOptional()
  public branchId?: string;

  @IsEnum(EmploymentRole)
  @IsOptional()
  public role?: EmploymentRole;
}
