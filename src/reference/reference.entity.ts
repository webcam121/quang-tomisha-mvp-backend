import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from 'src/user/user.entity';
import { EntityTimestamp } from 'src/shared/entity/timestamp';

@Entity({ name: 'references' })
export class Reference extends EntityTimestamp {
  @PrimaryGeneratedColumn()
  public id: string;

  @Index()
  @Column('uuid', { nullable: true })
  public userId: string;

  @Index()
  @Column('uuid', { nullable: true })
  public refUserId: string;

  @Column({ length: 500, nullable: true })
  public description: string;

  @Column({ length: 250, nullable: true })
  public criterias: string;

  @Column('smallint', { nullable: true })
  public rating: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'refUserId' })
  public refUser: User;

  @ManyToOne(() => User, user => user.references, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  public user: User;
}
