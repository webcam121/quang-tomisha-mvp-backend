import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, BeforeInsert, Index } from 'typeorm';
import { User } from '../user/user.entity';
import { EntityTimestamp } from 'src/shared/entity/timestamp';
import { generateSlug } from 'src/shared/utils';
import { OccupationPreference } from './occupation-preference.entity';
import { HardSkill } from 'src/hard-skill/hard-skill.entity';
import { Tag } from 'src/tag/tag.entity';
import { JobRelationship } from 'src/job/type/job-relationship.enum';
import { Employment } from 'src/employment/employment.entity';

@Entity({ name: 'occupations' })
export class Occupation extends EntityTimestamp {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Index()
  @Column('uuid', { nullable: true })
  public userId: string;

  @Column()
  public professionId: number;

  @Index()
  @Column()
  public slug: string;

  @Column('smallint', { default: 0, nullable: true })
  public level: number;

  @Column('smallint', { default: 0 })
  public minWorkload: number;

  @Column('smallint', { default: 100 })
  public maxWorkload: number;

  @Column('smallint', { array: true, nullable: true })
  public relationships: JobRelationship[];

  @Column({ length: 250, nullable: true })
  public specialSkill: string;

  @Column({ nullable: true })
  public skillDescription: string;

  @Column({ nullable: true })
  public shortDescription: string;

  @ManyToOne(() => Tag, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'professionId' })
  public profession: Tag;

  @OneToMany(() => OccupationPreference, pref => pref.occupation, { cascade: true })
  public preferences: OccupationPreference[];

  @OneToMany(() => HardSkill, skill => skill.occupation, { cascade: true })
  public hardSkills: HardSkill[];

  @OneToMany(() => Employment, em => em.occupation, { cascade: true })
  public employments: Employment[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  public user: User;

  @BeforeInsert()
  public beforeInsert(): void {
    this.slug = generateSlug();
  }
}
