import { IsString, Length, IsOptional, IsUUID } from 'class-validator';

export class FindUserDto {
  @IsUUID()
  @IsOptional()
  public id?: string;

  @IsString()
  @Length(1, 250)
  @IsOptional()
  public slug?: string;

  @IsUUID()
  @IsOptional()
  public occupationId?: string;

  @IsString()
  @Length(1, 250)
  @IsOptional()
  public occupationSlug?: string;
}
