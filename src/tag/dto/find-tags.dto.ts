import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { Tag } from '../tag.entity';
import { TagType } from '../type/tag-type.enum';

export class FindTagsDto extends PaginationDto<Tag> {
  @IsString()
  @MaxLength(200)
  @IsOptional()
  public title? :string;

  @Type(() => Number)
  @IsEnum(TagType)
  @IsNotEmpty()
  public type: TagType;
}