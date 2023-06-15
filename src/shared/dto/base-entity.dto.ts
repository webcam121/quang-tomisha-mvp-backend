import { IsString, IsInt, Length } from "class-validator";

export class BaseEntityDto {
  @IsInt()
  public id: number;

  @IsString()
  @Length(1, 250)
  public title: string;
}
