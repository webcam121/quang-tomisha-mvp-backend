import { IsString, MaxLength } from 'class-validator';

export class CreateReportDto {
  @IsString()
  @MaxLength(250)
  public message: string;

  @IsString()
  @MaxLength(250)
  public url: string;
}
