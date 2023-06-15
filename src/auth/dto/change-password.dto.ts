import { IsString, Length } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @Length(8, 50)
  public oldPassword: string;

  @IsString()
  @Length(8, 50)
  public newPassword: string;
}