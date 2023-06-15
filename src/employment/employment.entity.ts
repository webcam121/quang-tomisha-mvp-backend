import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { Occupation } from '../occupation/occupation.entity';
import { File } from 'src/file/file.entity';
import { Branch } from 'src/branch/branch.entity';
import { Tag } from 'src/tag/tag.entity';
import { EmploymentRole } from './type/employment-role.enum';
import { User } from 'src/user/user.entity';

@Entity({ name: 'employments' })
export class Employment {
  @PrimaryGeneratedColumn()
  public id: number;

  @Index()
  @Index()
  @Column('uuid', { nullable: true })
  public userId: string;

  @Index()
  @Index()
  @Column('uuid', { nullable: true })
  public companyId: string;

  @Index()
  @Index()
  @Column('uuid', { nullable: true })
  public agencyId: string;

  @Index()
  @Column({ nullable: true })
  public agentId: number;

  @Index()
  @Column('uuid', { nullable: true })
  public occupationId: string;

  @Column('uuid', { nullable: true })
  public branchId: string;

  @Column({ nullable: true })
  public professionId: number;

  @Index()
  @Column('smallint', { nullable: true })
  public role: EmploymentRole;

  @Column('smallint', { array: true, nullable: true })
  public relationships: number[];

  @Column('smallint', { nullable: true })
  public minWorkload: number;

  @Column('smallint', { nullable: true })
  public maxWorkload: number;

  @Column('smallint', { nullable: true })
  public level: number;

  @Column('smallint', { nullable: true })
  public years: number;

  @Column('date', { nullable: true })
  public startedAt: Date;

  @Column('date', { nullable: true })
  public endedAt: Date;

  @Column({ nullable: true })
  public description: string;

  @OneToMany(() => File, file => file.employment, { cascade: true })
  public files: File[];

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branchId' })
  public branch: Branch;

  @ManyToOne(() => Tag, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'professionId' })
  public profession: Tag;

  @ManyToOne(() => Occupation, occu => occu.employments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'occupationId' })
  public occupation: Occupation;

  @ManyToOne(() => User, user => user.employments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  public user: User;

  @ManyToOne(() => User, company => company.staffs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  public company: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agencyId' })
  public agency: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agentId' })
  public agent: User;
}
