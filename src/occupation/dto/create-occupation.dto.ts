import { IsInt, IsString, MaxLength, IsArray, ArrayMinSize, ArrayUnique, Min, Max, IsOptional, IsNotEmpty, IsObject } from 'class-validator';
import { Employment } from 'src/employment/employment.entity';
import { HardSkill } from 'src/hard-skill/hard-skill.entity';
import { JobRelationship } from 'src/job/type/job-relationship.enum';
import { Tag } from 'src/tag/tag.entity';
import { OccupationPreference } from '../occupation-preference.entity';

export class CreateOccupationDto {
  @IsObject()
  @IsNotEmpty()
  public profession: Tag;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsOptional()
  public relationships?: JobRelationship[];

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  public level?: number;

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
  public specialSkill?: string;

  @IsString()
  @IsOptional()
  public skillDescription?: string;

  @IsString()
  @IsOptional()
  public shortDescription?: string;

  @IsArray()
  @IsOptional()
  public hardSkills?: HardSkill[];

  @IsArray()
  @IsOptional()
  public employments?: Employment[];

  @IsArray()
  @IsOptional()
  public preferences?: OccupationPreference[];
}
