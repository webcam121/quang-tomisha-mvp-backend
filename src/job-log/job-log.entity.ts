import { Application } from 'src/application/application.entity';
import { Interview } from 'src/interview/interview.entity';
import { Offer } from 'src/offer/offer.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { JobLogAction } from './type/job-log-action.enum';

@Entity({ name: 'job-logs' })
export class JobLog {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column('smallint')
  public action: JobLogAction;

  @Column('uuid')
  public userId: string;

  @Index()
  @Column({ nullable: true })
  public applicationId: number;

  @Index()
  @Column({ nullable: true })
  public interviewId: number;

  @Index()
  @Column({ nullable: true })
  public offerId: number;

  @CreateDateColumn()
  public createdAt: Date;

  @ManyToOne(() => Application, application => application.logs)
  @JoinColumn({ name: 'applicationId' })
  public application: Application;

  @ManyToOne(() => Interview, interview => interview.logs)
  @JoinColumn({ name: 'interviewId' })
  public interview: Interview;

  @ManyToOne(() => Offer, offer => offer.logs)
  @JoinColumn({ name: 'offerId' })
  public offer: Offer;
}
