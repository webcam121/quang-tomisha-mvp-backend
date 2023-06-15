import { EntityTimestamp } from 'src/shared/entity/timestamp';
import { User } from 'src/user/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ReportStatus } from './type/report-status.enum';

@Entity({ name: 'reports' })
export class Report extends EntityTimestamp {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ length: 500 })
  public message: string;

  @Column({ length: 250 })
  public url: string;

  @Column('smallint', { default: ReportStatus.NEW })
  public status: ReportStatus;

  @Column('uuid', { nullable: true })
  public createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  public createdBy: User;
}
