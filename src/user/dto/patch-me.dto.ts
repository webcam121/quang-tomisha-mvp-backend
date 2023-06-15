import { IsEnum, IsString, IsOptional, IsDateString, IsArray, IsInt, MaxLength, Length, IsBoolean, IsDate, IsNotIn, ArrayUnique, IsObject } from 'class-validator';
import { UserType } from '../type/user-type.enum';
import { UserStatus } from '../type/user-status.enum';
import { UserGender } from '../type/user-gender.enum';
import { UserMaritalStatus } from '../type/user-marital-status.enum';
import { UserDocument } from '../user-document.entity';
import { File } from '../../file/file.entity';
import { Address } from 'src/address/address.entity';
import { SoftSkill } from 'src/soft-skill/soft-skill.entity';
import { Tag } from 'src/tag/tag.entity';
import { Type } from 'class-transformer';
import { EmailAdType } from '../type/email-ad-type.enum';

export class PatchMeDto {
  @IsString()
  @MaxLength(120)
  @IsOptional()
  public slug?: string;

  @IsInt()
  @IsOptional()
  public progress?: number;

  @IsEnum(UserType)
  @IsOptional()
  public type?: UserType;

  @IsEnum(UserStatus)
  @IsNotIn([UserStatus.DEACTIVATED, UserStatus.LOCKED])
  @IsOptional()
  public status?: UserStatus;

  @IsString()
  @MaxLength(250)
  @IsOptional()
  public cover?: string;

  @IsString()
  @MaxLength(250)
  @IsOptional()
  public picture?: string;

  @IsEnum(UserGender)
  @IsOptional()
  public gender?: UserGender;

  @IsEnum(UserMaritalStatus)
  @IsOptional()
  public maritalStatus?: UserMaritalStatus;

  @IsString()
  @MaxLength(250)
  @IsOptional()
  public firstName?: string;

  @IsString()
  @MaxLength(250)
  @IsOptional()
  public lastName?: string;

  @IsObject()
  @IsOptional()
  public address?: Address;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  public phone?: string;

  @IsDateString()
  @IsOptional()
  public dob?: string;

  @IsString()
  @MaxLength(250)
  @IsOptional()
  public pob?: string;

  @IsString()
  @Length(2)
  @IsOptional()
  public nationality?: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  public locale?: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  public emailLocale?: string;

  @IsBoolean()
  @IsOptional()
  public publicRef?: boolean;

  @IsBoolean()
  @IsOptional()
  public public?: boolean;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  public lastActiveAt?: Date;

  @IsEnum(EmailAdType, { each: true })
  @ArrayUnique()
  @IsOptional()
  public emailAdTypes?: EmailAdType[];

  @IsArray()
  @IsOptional()
  public documents?: UserDocument[];

  @IsArray()
  @IsOptional()
  public softSkills?: SoftSkill[];

  @IsArray()
  @IsOptional()
  public files?: File[];

  @IsArray()
  @IsOptional()
  public hobbies?: Tag[];
}
