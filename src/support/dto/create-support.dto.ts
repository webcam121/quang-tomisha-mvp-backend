import { Transform } from 'class-transformer';
import { IsEmail, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { Address } from 'src/address/address.entity';

export class CreateSupportDto {
  @IsObject()
  @IsOptional()
  public address?: Address;

  @Transform((email) => email?.toLowerCase?.().trim())
  @IsEmail()
  public email: string;

  @IsString()
  @MaxLength(500)
  public name: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  public website?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  public message?: string;
}
