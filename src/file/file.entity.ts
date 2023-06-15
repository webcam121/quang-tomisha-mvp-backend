import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../user/user.entity';
import { Degree } from 'src/degree/degree.entity';
import { Employment } from 'src/employment/employment.entity';

@Entity({ name: 'files' })
export class File {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: true, length: 250 })
  public name: string;

  @Column({ nullable: true, length: 250 })
  public url: string;

  @Index()
  @Column('uuid', { nullable: true })
  public userId: string;

  @Column('uuid', { nullable: true })
  public degreeId: string;

  @Column('uuid', { nullable: true })
  public employmentId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  public user: User;

  @ManyToOne(() => Degree, evt => evt.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'degreeId' })
  public degree: Degree;

  @ManyToOne(() => Employment, evt => evt.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employmentId' })
  public employment: Employment;
}
