import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { EntityTimestamp } from 'src/shared/entity/timestamp';
import { User } from 'src/user/user.entity';
import { Job } from 'src/job/job.entity';
import { generateSlug } from 'src/shared/utils';
import { Employment } from 'src/employment/employment.entity';
import { Application } from 'src/application/application.entity';
import { JobLog } from 'src/job-log/job-log.entity';
import { Branch } from 'src/branch/branch.entity';

@Entity({ name: 'offers' })
export class Offer extends EntityTimestamp {
  @PrimaryGeneratedColumn()
  public id: number;

  @Index()
  @Column('uuid')
  public userId: string;

  @Index()
  @Column('uuid')
  public jobId: string;

  @Index()
  @Column('uuid')
  public companyId: string;

  @Index()
  @Column()
  public applicationId: number;

  @Column({ nullable: true })
  public staffId: number;

  @Column('uuid')
  public branchId: string;

  @Column('uuid', { nullable: true })
  public agentId: string;

  @Index()
  @Column('uuid', { nullable: true })
  public agencyId: string;

  @Column({ length: 50 })
  public slug: string;

  @Column({ length: 500, nullable: true })
  public message: string;

  @Column({ length: 500, nullable: true })
  public agentMessage: string;

  @Column({ nullable: true })
  public startAt: Date;

  @OneToMany(() => JobLog, jobLog => jobLog.offer)
  public logs: JobLog[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  public user: User;

  @ManyToOne(() => Job)
  @JoinColumn({ name: 'jobId' })
  public job: Job;

  @ManyToOne(() => Employment)
  @JoinColumn({ name: 'staffId' })
  public staff: Employment;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branchId' })
  public branch: Branch;

  @ManyToOne(() => Employment)
  @JoinColumn({ name: 'agentId' })
  public agent: Employment;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'agencyId' })
  public agency: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'companyId' })
  public company: User;

  @ManyToOne(() => Application)
  @JoinColumn({ name: 'applicationId' })
  public application: Application;

  @BeforeInsert()
  public beforeInsert(): void {
    this.slug = generateSlug();
  }
}
