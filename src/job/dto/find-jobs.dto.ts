import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { IsInt, IsOptional, MaxLength, IsString, Min, Max, IsNumber, IsUUID, IsArray } from 'class-validator';
import { Job } from '../job.entity';
import { Transform, Type } from 'class-transformer';

export class FindJobsDto extends PaginationDto<Job> {
  @IsUUID()
  @IsOptional()
  public companyId?: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  public professionId?: number;

  @Transform(t => t ? decodeURIComponent(t) : '')
  @IsString()
  @MaxLength(250)
  @IsOptional()
  public title?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  public minWorkload?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  public maxWorkload?: number;

  @Transform(sizes => decodeURIComponent(sizes || '').split(',').map(s => s.split('_').map(n => +n)))
  @IsArray()
  @IsOptional()
  public sizes?: [number, number][];

  @Transform(rels => decodeURIComponent(rels || '').split(',').map(r => +r))
  @IsArray()
  @IsOptional()
  public relationships?: number[];

  @Transform(ids => decodeURIComponent(ids || '').split(','))
  @IsArray()
  @IsOptional()
  public branchIds?: string[];

  @IsString()
  @MaxLength(200)
  @IsOptional()
  public city?: String;

  @IsString()
  @MaxLength(3)
  @IsOptional()
  public country?: String;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  public lat?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  public lng?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  public miles?: number;
}
