import { PartialType, PickType } from '@nestjs/swagger';
import { IsInt, IsString, MaxLength, IsArray, Min, Max, IsOptional, IsEnum, IsDateString, IsUUID, IsObject } from 'class-validator';
import { File } from 'src/file/file.entity';
import { Branch } from 'src/branch/branch.entity';
import { DegreeType } from '../type/degree-type.enum';

class PartialFile extends PartialType(PickType(File, ['id', 'name', 'url'])) {}
class PartialBranch extends PartialType(PickType(Branch, ['id', 'slug', 'name', 'cover', 'picture', 'addresses'])) {}

export class CreateDegreeDto {
  @IsEnum(DegreeType)
  @IsOptional()
  public type?: number;

  @IsString()
  @MaxLength(15)
  @IsOptional()
  public languageId?: string;

  @IsInt()
  @IsOptional()
  public subType: number;

  @IsUUID()
  @IsOptional()
  public userId?: string;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  public minWorkload?: number;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  public maxWorkload?: number;

  @IsString()
  @MaxLength(250)
  @IsOptional()
  public title?: string;

  @IsInt()
  @IsOptional()
  public level?: number;

  @IsDateString()
  @IsOptional()
  public startedAt?: Date;

  @IsDateString()
  @IsOptional()
  public endedAt?: Date;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  public description?: string;

  @IsArray()
  @IsOptional()
  public files?: PartialFile[];

  @IsObject()
  @IsOptional()
  public branch?: PartialBranch;
}
