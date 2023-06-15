import { IsNotEmpty, IsString, Length, IsJWT } from "class-validator";

export class ResetPasswordDto {
  @IsString()
  @Length(8, 50)
  public newPassword: string;

  @IsString()
  @IsJWT()
  @IsNotEmpty()
  public token: string;
}
