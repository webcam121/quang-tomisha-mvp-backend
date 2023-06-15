import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { EntityTimestamp } from 'src/shared/entity/timestamp';
import { Employment } from 'src/employment/employment.entity';
import { User } from 'src/user/user.entity';

@Entity({ name: 'subscriptions' })
export class Subscription extends EntityTimestamp {
  @PrimaryGeneratedColumn()
  public id: number;

  @Index()
  @Column('uuid')
  public companyId: string;

  @Index()
  @Column({ nullable: true })
  public staffId: number;

  @Index()
  @Column({ length: 250, nullable: true })
  public planId: string;

  @Column('date')
  public startAt: Date;

  @Column('date')
  public endAt: Date;

  @Column('smallint', { nullable: true })
  public branchAmount: number;

  @Column('smallint', { nullable: true })
  public staffAmount: number;

  @Column('smallint', { nullable: true })
  public jobAmount: number;

  @Column('float8', { nullable: true })
  public total: number;

  @Column('float8', { nullable: true })
  public discount: number;

  @Column('float8', { nullable: true })
  public vat: number;

  @Index()
  @Column({ length: 500, nullable: true })
  public receipt: string;

  @Column({ length: 500, nullable: true })
  public receiptId: string;

  @Column('smallint', { nullable: true })
  public remainingJobs: number;

  @ManyToOne(() => User, com => com.subscriptions)
  @JoinColumn({ name: 'companyId' })
  public company: User;

  @ManyToOne(() => Employment)
  @JoinColumn({ name: 'staffId' })
  public staff: Employment;
}
