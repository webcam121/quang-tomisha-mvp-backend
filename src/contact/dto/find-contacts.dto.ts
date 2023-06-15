import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from 'src/shared/dto/pagination.dto'
import { Contact } from '../contact.entity';
import { ContactStatus } from '../type/contact-status.enum';

export class FindContactsDto extends PaginationDto<Contact> {
  @Type(() => Number)
  @IsEnum(ContactStatus)
  @IsNotEmpty()
  public status: ContactStatus;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  public name?: string;
}
