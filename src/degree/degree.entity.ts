import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { User } from '../user/user.entity';
import { File } from 'src/file/file.entity';
import { Branch } from 'src/branch/branch.entity';
import { DegreeType } from './type/degree-type.enum';

@Entity({ name: 'degrees' })
export class Degree {
  @PrimaryGeneratedColumn()
  public id: number;

  @Index()
  @Column('smallint', { nullable: true })
  public type: DegreeType;

  @Column({ nullable: true, length: 15 })
  public languageId: string;

  @Column('smallint', { nullable: true })
  public subType: number;

  @Column({ length: 250, nullable: true })
  public title: string;

  @Column('smallint', { nullable: true })
  public level: number;

  @Column('date', { nullable: true })
  public startedAt: Date;

  @Column('date', { nullable: true })
  public endedAt: Date;

  @Column({ nullable: true })
  public description: string;

  @Index()
  @Column('uuid', { nullable: true })
  public userId: string;

  @Column('uuid', { nullable: true })
  public branchId: string;

  @OneToMany(() => File, file => file.degree, { cascade: true })
  public files: File[];

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branchId' })
  public branch: Branch;

  @ManyToOne(() => User, user => user.degrees, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  public user: User;
}
