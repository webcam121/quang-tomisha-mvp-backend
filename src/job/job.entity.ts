import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, BeforeInsert, Index } from 'typeorm';
import { EntityTimestamp } from 'src/shared/entity/timestamp';
import { User } from '../user/user.entity';
import { Branch } from 'src/branch/branch.entity';
import { Employment } from 'src/employment/employment.entity';
import { JobStatus } from './type/job-status.enum';
import { generateSlug } from 'src/shared/utils';
import { JobRelationship } from './type/job-relationship.enum';
import { JobSkill } from './job-skill.entity';
import { Tag } from 'src/tag/tag.entity';

@Entity({ name: 'jobs' })
export class Job extends EntityTimestamp {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Index()
  @Column()
  public slug: string;

  @Index()
  @Column('smallint', { default: JobStatus.OPEN })
  public status: JobStatus;

  @Index()
  @Column('uuid', { nullable: true })
  public companyId: string;

  @Index()
  @Column('uuid', { nullable: true })
  public branchId: string;

  @Column({ nullable: true })
  public staffId: number;

  @Column('uuid', { nullable: true })
  public createdById: string;

  @Index()
  @Column({ length: 500 })
  public title: string;

  @Index()
  @Column({ nullable: true })
  public professionId: number;

  @Index()
  @Column('smallint', { nullable: true })
  public minWorkload: number;

  @Index()
  @Column('smallint', { nullable: true })
  public maxWorkload: number;

  @Index()
  @Column('smallint', { nullable: true })
  public level: number;

  @Index()
  @Column('smallint', { nullable: true })
  public years: number;

  @Index()
  @Column('smallint', { array: true, nullable: true })
  public genders: number[];

  @Index()
  @Column('smallint', { array: true, nullable: true })
  public relationships: JobRelationship[];

  @Index()
  @Column({ nullable: true, default: true })
  public public: boolean;

  @Column({ length: 250, nullable: true })
  public cover: string;

  @Column({ nullable: true })
  public detail: string;

  @Column({ nullable: true })
  public benefit: string;

  @Column({ nullable: true })
  public requirement: string;

  @Index()
  @Column('date', { nullable: true })
  public publishAt: Date;

  @Index()
  @Column('date', { nullable: true })
  public endAt: Date;

  @OneToMany(() => JobSkill, skill => skill.job, { cascade: true })
  public skills: JobSkill[];

  @ManyToOne(() => Tag, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'professionId' })
  public profession: Tag;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branchId' })
  public branch: Branch;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'companyId' })
  public company: User;

  @ManyToOne(() => Employment)
  @JoinColumn({ name: 'staffId' })
  public staff: Employment;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  public createdBy: User;

  @BeforeInsert()
  public beforeInsert(): void {
    this.slug = generateSlug();
  }
}
