import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { TagType } from './type/tag-type.enum';

@Entity({ name: 'tag' })
export class Tag {
  @PrimaryGeneratedColumn()
  public id: number;

  @Index()
  @Column({ length: 500 })
  public title: string;

  @Index()
  @Column('smallint', { default: TagType.HOBBY })
  public type: TagType;
}
