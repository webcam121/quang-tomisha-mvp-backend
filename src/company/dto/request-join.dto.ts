import { Type } from 'class-transformer';
import { ArrayMinSize, ArrayUnique, IsArray, IsDate, IsInt, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

export class RequestJoinDto {
  @IsUUID()
  public companyId: string;

  @IsString()
  @MaxLength(500)
  public message: string;

  @IsInt()
  public professionId: number;

  @Type(() => Date)
  @IsDate()
  public startedAt: Date;

  @IsInt()
  @Min(0)
  @Max(100)
  public minWorkload: number;

  @IsInt()
  @Min(0)
  @Max(100)
  public maxWorkload: number;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  public relationships: number[];
}
