import { Transform } from 'class-transformer';
import { IsString, Length, IsOptional, IsEmail } from 'class-validator';

export class SearchUserDto {
  @IsString()
  @Length(1, 50)
  @IsOptional()
  public phone?: string;

  @Transform((email) => email?.toLowerCase?.().trim())
  @IsEmail()
  @IsOptional()
  public email?: string;

  @Transform((email) => email?.toLowerCase?.().trim())
  @IsEmail()
  @IsOptional()
  public businessEmail?: string;
}