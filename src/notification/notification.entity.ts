import { Branch } from 'src/branch/branch.entity';
import { EntityTimestamp } from 'src/shared/entity/timestamp';
import { EmploymentPermission } from 'src/employment/type/employment-permission.enum';
import { User } from 'src/user/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { NotificationStatus } from './type/notification-status.enum';
import { NotificationType } from './type/notification-type.enum';

@Entity({ name: 'notifications' })
export class Notification extends EntityTimestamp {
  @PrimaryGeneratedColumn()
  public id: number;

  @Index()
  @Column('smallint', { default: NotificationStatus.ACTIVE })
  public status: NotificationStatus;

  @Column('smallint')
  public type: NotificationType;

  @Index()
  @Column('uuid', { nullable: true })
  public userId: string;

  @Index()
  @Column('uuid', { nullable: true })
  public companyId: string;

  @Column('uuid', { nullable: true })
  public fromUserId: string;

  @Column('uuid', { nullable: true })
  public fromBranchId: string;

  @Column({ nullable: true, length: 500 })
  public message: string;

  @Column('smallint', { nullable: true })
  public minRole: EmploymentPermission;

  @Column({ nullable: true, length: 500 })
  public metadata: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  public user: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  public company: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fromUserId' })
  public fromUser: User;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fromBranchId' })
  public fromBranch: Branch;
}
