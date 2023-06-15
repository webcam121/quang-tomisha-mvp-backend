import { Type, Transform } from 'class-transformer';
import { IsString, IsOptional, MaxLength, IsInt, Max, IsBoolean } from 'class-validator';
import { User } from '../user.entity';

export class SearchUsersDto {
  @IsString()
  @MaxLength(250)
  @IsOptional()
  public firstName?: string;

  @IsString()
  @MaxLength(250)
  @IsOptional()
  public lastName?: string;

  @Transform((email) => email?.toLowerCase?.().trim())
  @IsOptional()
  public email?: string;

  @IsString()
  @MaxLength(250)
  @IsOptional()
  public city?: string;

  @IsString()
  @MaxLength(250)
  @IsOptional()
  public country?: string;

  @Transform((v) => v === 'true')
  @IsBoolean()
  @IsOptional()
  public friend?: boolean;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  public order?: keyof User | 'name';

  @Transform((v) => v === 'true')
  @IsBoolean()
  @IsOptional()
  public asc?: boolean;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  public skip?: number;

  @Type(() => Number)
  @IsInt()
  @Max(100)
  @IsOptional()
  public take?: number;
}
