import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Job } from 'src/job/job.entity';
import { Tag } from 'src/tag/tag.entity';

@Entity({ name: 'job-skills' })
export class JobSkill {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column('uuid', { nullable: true })
  public jobId: string;

  @Column('smallint', { nullable: true })
  public hardSkillId: number;

  @Column('smallint', { nullable: true })
  public professionId: number;

  @Column('smallint', { nullable: true })
  public softSkillId: number;

  @Column({ nullable: true, length: 15 })
  public languageId: string;

  @Column('smallint', { nullable: true })
  public level: number;

  @Column('smallint', { nullable: true })
  public years: number;

  @Column({ length: 500, nullable: true })
  public description: string;

  @ManyToOne(() => Job, job => job.skills, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobId' })
  public job: Job;

  @ManyToOne(() => Tag)
  @JoinColumn({ name: 'skillId' })
  public hardSkill: Tag;

  @ManyToOne(() => Tag)
  @JoinColumn({ name: 'professionId' })
  public profession: Tag;
}
