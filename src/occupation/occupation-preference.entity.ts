import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Occupation } from './occupation.entity';

@Entity({ name: 'occupation-perferences' })
export class OccupationPreference {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column('smallint')
  public preferenceId: number;

  @Column('smallint')
  public level: number;

  @Column('uuid', { nullable: true })
  public occupationId: string;

  @ManyToOne(() => Occupation, occu => occu.preferences, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'occupationId' })
  public occupation: Occupation;
}
