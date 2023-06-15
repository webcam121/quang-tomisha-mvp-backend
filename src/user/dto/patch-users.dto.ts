import { IsOptional, IsArray, IsNotEmpty, IsEnum, IsBoolean } from 'class-validator';
import { UserStatus } from '../type/user-status.enum';

export class PatchUsersDto {
  @IsArray()
  @IsNotEmpty()
  public ids: string[];

  @IsEnum(UserStatus)
  @IsOptional()
  public status?: UserStatus;

  @IsBoolean()
  @IsOptional()
  public isAdmin?: boolean;
}
