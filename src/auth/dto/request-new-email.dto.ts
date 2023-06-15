import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length } from 'class-validator';

export class RequestNewEmailDto {
  @IsString()
  @Length(8, 50)
  public password: string;

  @Transform((email) => email?.toLowerCase?.().trim())
  @IsEmail()
  email: string;
}