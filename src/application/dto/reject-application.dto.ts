import { IsInt, IsString, IsUUID, MaxLength } from 'class-validator';

export class RejectApplicationDto {
  @IsInt()
  public id: number;

  @IsUUID()
  public companyId: string;

  @IsString()
  @MaxLength(200)
  public password: string;
}