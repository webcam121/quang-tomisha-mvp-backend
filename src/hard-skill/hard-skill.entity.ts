import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Occupation } from 'src/occupation/occupation.entity';
import { Tag } from 'src/tag/tag.entity';

@Entity({ name: 'hard-skills' })
export class HardSkill {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column('smallint')
  public skillId: number;

  @Column('smallint')
  public level: number;

  @Column({ length: 500, nullable: true })
  public description: string;

  @Index()
  @Column('uuid', { nullable: true })
  public occupationId: string;

  @ManyToOne(() => Occupation, occu => occu.hardSkills, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'occupationId' })
  public occupation: Occupation;

  @ManyToOne(() => Tag)
  @JoinColumn({ name: 'skillId' })
  public skill: Tag;
}
