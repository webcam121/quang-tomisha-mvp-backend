import { IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class ForgotPasswordDto {
  @Transform((email) => email?.toLowerCase?.().trim())
  @IsEmail()
  public email: string;
}