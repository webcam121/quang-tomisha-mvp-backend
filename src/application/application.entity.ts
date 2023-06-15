import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { EntityTimestamp } from 'src/shared/entity/timestamp';
import { User } from 'src/user/user.entity';
import { Job } from 'src/job/job.entity';
import { Occupation } from 'src/occupation/occupation.entity';
import { generateSlug } from 'src/shared/utils';
import { JobLog } from 'src/job-log/job-log.entity';

@Entity({ name: 'applications' })
export class Application extends EntityTimestamp {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column('uuid', { nullable: true })
  public userId: string;

  @Column('uuid', { nullable: true })
  public companyId: string;

  @Column('uuid')
  public jobId: string;

  @Column('uuid')
  public occupationId: string;

  @Column({ length: 50 })
  public slug: string;

  @Column({ length: 500, nullable: true })
  public message: string;

  @OneToMany(() => JobLog, jobLog => jobLog.application)
  public logs: JobLog[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  public user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'companyId' })
  public company: User;

  @ManyToOne(() => Job)
  @JoinColumn({ name: 'jobId' })
  public job: Job;

  @ManyToOne(() => Occupation)
  @JoinColumn({ name: 'occupationId' })
  public occupation: Occupation;

  @BeforeInsert()
  public beforeInsert(): void {
    this.slug = generateSlug();
  }
}
