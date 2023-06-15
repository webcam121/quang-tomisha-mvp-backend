import { IsUUID, IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateApplicationDto {
  @IsUUID()
  public jobId: string;

  @IsUUID()
  public occupationId: string;

  @IsString()
  @MaxLength(200)
  public password: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  public message?: string;
}
