import { IsString, IsUUID, IsOptional, MaxLength, IsDateString, IsInt, Min, Max, IsBoolean, IsObject } from 'class-validator';
import { Address } from "src/address/address.entity";

export class CreateBranchDto {
  @IsUUID()
  @IsOptional()
  public companyId?: string;

  @IsString()
  @IsOptional()
  public token?: string;

  @IsBoolean()
  @IsOptional()
  public isHeadquater?: boolean;

  @IsString()
  @MaxLength(500)
  public name: string;

  @IsString()
  @MaxLength(250)
  @IsOptional()
  public designation?: string;

  @IsString()
  @MaxLength(250)
  @IsOptional()
  public cover?: string;

  @IsString()
  @MaxLength(250)
  @IsOptional()
  public picture?: string;

  @IsString()
  @MaxLength(250)
  @IsOptional()
  public email?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  public phone?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  public slogan?: string;

  @IsString()
  @MaxLength(5000)
  @IsOptional()
  public description?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  public website?: string;

  @IsDateString()
  @IsOptional()
  public foundedAt?: Date;

  @IsInt()
  @Min(0)
  @Max(100000)
  @IsOptional()
  public totalPermanents?: number;

  @IsInt()
  @Min(0)
  @Max(100000)
  @IsOptional()
  public totalInterns?: number;

  @IsInt()
  @Min(0)
  @Max(100000)
  @IsOptional()
  public size?: number;

  @IsObject()
  @IsOptional()
  public address?: Address;
}
