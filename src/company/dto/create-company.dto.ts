import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @Length(1, 250)
  public email: string;

  @IsString()
  @IsNotEmpty()
  public token: string;
}
