import { Type } from 'class-transformer';
import { IsUUID, IsString, Length, IsOptional, MaxLength, IsEnum } from 'class-validator';
import { UserType } from 'src/user/type/user-type.enum';

export class FindBranchesDto {
  @IsUUID()
  @IsOptional()
  public companyId?: string;

  @IsString()
  @Length(1, 250)
  @IsOptional()
  public name?: string;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  public city?: String;

  @IsString()
  @MaxLength(3)
  @IsOptional()
  public country?: String;

  @Type(() => Number)
  @IsEnum(UserType)
  @IsOptional()
  public type?: UserType;
}
