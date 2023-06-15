import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EntityTimestamp } from 'src/shared/entity/timestamp';
import { User } from 'src/user/user.entity';

@Entity({ name: 'reference-viewers' })
export class ReferenceViewer extends EntityTimestamp {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column('uuid')
  public userId: string;

  @Column('uuid')
  public viewerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  public user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'viewerId' })
  public viewer: User;
}
