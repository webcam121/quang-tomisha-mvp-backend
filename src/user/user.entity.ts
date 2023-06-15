import { Column, Entity, PrimaryGeneratedColumn, Index, BeforeInsert, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserStatus } from './type/user-status.enum';
import { UserType } from './type/user-type.enum';
import { UserGender } from './type/user-gender.enum';
import { UserMaritalStatus } from './type/user-marital-status.enum';
import { UserDocument } from './user-document.entity';
import { File } from '../file/file.entity';
import { Tag } from '../tag/tag.entity';
import { hash, generateSlug } from '../shared/utils';
import { Reference } from 'src/reference/reference.entity';
import { Address } from '../address/address.entity';
import { SoftSkill } from 'src/soft-skill/soft-skill.entity';
import { EntityTimestamp } from 'src/shared/entity/timestamp';
import { Occupation } from 'src/occupation/occupation.entity';
import { EmailAdType } from './type/email-ad-type.enum';
import { Branch } from 'src/branch/branch.entity';
import { Degree } from 'src/degree/degree.entity';
import { Employment } from 'src/employment/employment.entity';
import { Subscription } from 'src/subscription/subscription.entity';

@Entity({ name: 'users' })
export class User extends EntityTimestamp {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Index({ unique: true })
  @Column()
  public email: string;

  @Exclude()
  @Column({ select: false, nullable: true })
  public password: string;

  @Column('smallint', { nullable: true })
  public type: UserType;

  @Index({ unique: true })
  @Column({ length: 120 })
  public slug: string;

  @Column('smallint', { default: 0, nullable: true })
  public progress: number;

  @Index()
  @Column('smallint', { default: UserStatus.AVAILABLE_ACTIVELY })
  public status: UserStatus;

  @Column('smallint', { nullable: true })
  public gender: UserGender;

  @Column('smallint', { nullable: true })
  public maritalStatus: UserMaritalStatus;

  @Column({ nullable: true, length: 250 })
  public firstName: string;

  @Column({ nullable: true, length: 250 })
  public lastName: string;

  @Column({ nullable: true, length: 250 })
  public cover: string;

  @Column({ nullable: true, length: 250 })
  public picture: string;

  @Column({ nullable: true, length: 50 })
  public phone: string;

  @Column('date', { nullable: true })
  public dob: Date;

  @Column({ nullable: true, length: 2 })
  public nationality: string;

  @Column({ nullable: true, length: 250 })
  public pob: string;

  @Column({ nullable: true, default: true })
  public public: boolean;

  @Column({ nullable: true, default: false })
  public publicRef: boolean;

  @Column({ nullable: true, length: 20, default: 'ch' })
  public locale: string;

  @Column({ nullable: true })
  public lastActiveAt: Date;

  @Column('smallint', { array: true, nullable: true, default: `{${EmailAdType.NEW_JOB}, ${EmailAdType.CONTACT_INVITATION}}` })
  public emailAdTypes: EmailAdType[];

  @Column({ nullable: true })
  public isAdmin: boolean;

  @OneToMany(() => Address, address => address.user, { cascade: true })
  public addresses: Address[];

  @OneToMany(() => UserDocument, userDoc => userDoc.user, { cascade: true })
  public documents: UserDocument[];

  @OneToMany(() => SoftSkill, softSkill => softSkill.user, { cascade: true })
  public softSkills: SoftSkill[];

  @OneToMany(() => File, file => file.user, { cascade: true })
  public files: File[];

  @OneToMany(() => Degree, exp => exp.user)
  public degrees: Degree[];

  @ManyToMany(() => Tag, { cascade: true })
  @JoinTable()
  public hobbies: Tag[];

  @OneToMany(() => Reference, ref => ref.user)
  public references: Reference[];

  @OneToMany(() => Employment, em => em.user)
  public employments: Employment[];

  @OneToMany(() => Occupation, occupation => occupation.user)
  public occupations: Occupation[];

  @OneToMany(() => Subscription, sub => sub.company)
  public subscriptions: Subscription[];

  // For company
  @OneToMany(() => Branch, branch => branch.company)
  public branches: Branch[];

  @OneToMany(() => Employment, staff => staff.company, { cascade: true })
  public staffs: Employment[];

  @BeforeInsert()
  public beforeInsert(): void {
    if (this.password) {
      this.password = hash(this.password);
    }
    this.slug = generateSlug();
  }
}
