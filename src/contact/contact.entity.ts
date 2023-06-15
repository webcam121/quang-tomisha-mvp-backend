import { EntityTimestamp } from 'src/shared/entity/timestamp';
import { User } from 'src/user/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ContactStatus } from './type/contact-status.enum';

@Entity({ name: 'contacts' })
export class Contact extends EntityTimestamp {
  @PrimaryGeneratedColumn()
  public id: number;

  @Index()
  @Column('uuid', { nullable: true })
  public userId: string;

  @Index()
  @Column('uuid', { nullable: true })
  public contactUserId: string;

  @Index()
  @Column('smallint', { default: ContactStatus.UNREAD })
  public status: ContactStatus;

  @Column({ nullable: true })
  public invitedAt: Date;

  @Column({ nullable: true })
  public acceptedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  public user: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contactUserId' })
  public contactUser: User;
}
