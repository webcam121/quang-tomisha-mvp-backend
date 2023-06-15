import { EntityTimestamp } from 'src/shared/entity/timestamp';
import { User } from 'src/user/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SupportStatus } from './type/support-status.enum';

@Entity({ name: 'supports' })
export class Support extends EntityTimestamp {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: true, length: 500 })
  public message: string;

  @Column({ nullable: true, length: 250 })
  public name: string;

  @Column({ length: 150 })
  public email: string;

  @Column({ length: 1000, nullable: true })
  public address: string; // JSON string

  @Column({ nullable: true, length: 500 })
  public website: string;

  @Column('smallint', { default: SupportStatus.NEW })
  public status: SupportStatus;

  @Column('uuid', { nullable: true })
  public createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  public createdBy: User;
}
