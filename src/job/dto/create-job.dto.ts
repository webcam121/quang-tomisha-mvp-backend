import { IsString, MaxLength, IsBoolean, IsArray, ArrayMinSize, ArrayUnique, IsDateString, IsObject, Max, Min, IsInt, IsUUID, IsOptional } from 'class-validator';
import { Tag } from 'src/tag/tag.entity';
import { JobSkill } from '../job-skill.entity';
import { JobRelationship } from '../type/job-relationship.enum';

export class CreateJobDto {
  @IsObject()
  public profession: Tag;

  @IsString()
  @MaxLength(250)
  public title: string;

  @IsUUID()
  public branchId: string;

  @IsInt()
  public staffId: number;

  @IsUUID()
  public companyId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  public genders: number[];

  @IsInt()
  @Min(0)
  @Max(100)
  public level: number;

  @IsInt()
  @Min(0)
  @Max(100)
  public years: number;

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
  public relationships: JobRelationship[];

  @IsString()
  @MaxLength(250)
  @IsOptional()
  public cover?: string;

  @IsString()
  @MaxLength(5000)
  public detail: string;

  @IsString()
  @MaxLength(5000)
  public benefit: string;

  @IsString()
  @MaxLength(5000)
  public requirement: string;

  @IsBoolean()
  public public: boolean;

  @IsDateString()
  public publishAt: Date;

  @IsArray()
  public skills: JobSkill[];
}
