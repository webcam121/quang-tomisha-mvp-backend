import { IsNotEmpty, IsString, Length, IsJWT, IsInt } from 'class-validator';
import { UserType } from 'src/user/type/user-type.enum';

export class RegisterDto {
  @IsString()
  @Length(8, 50)
  public password: string;

  @IsString()
  @IsJWT()
  @IsNotEmpty()
  public token: string;

  @IsString()
  @IsNotEmpty()
  public captcha: string;

  @IsInt()
  @IsNotEmpty()
  public type: UserType;
}
