import { IsInt, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  @IsOptional()
  public planId?: string;

  @IsString()
  @IsOptional()
  public couponId?: string;

  @IsInt()
  @IsOptional()
  public jobAmount?: number;

  @IsString()
  @IsNotEmpty()
  public stripeToken: string;

  @IsObject()
  public metadata: object;

  @IsUUID()
  public companyId: string;

  @IsString()
  @MaxLength(200)
  @IsNotEmpty()
  public password: string;
}
