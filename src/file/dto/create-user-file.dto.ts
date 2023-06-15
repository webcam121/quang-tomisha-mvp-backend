import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateUserFileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  public name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  public url: string;
}
