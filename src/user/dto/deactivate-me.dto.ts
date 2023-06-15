import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class DeactivateMeDto {
  @IsString()
  @IsOptional()
  public message?: string;

  @IsInt()
  @IsOptional()
  public reason?: number;

  @IsString()
  @IsNotEmpty()
  public password: string;

  @IsUUID()
  @IsOptional()
  public companyId?: string;
}
