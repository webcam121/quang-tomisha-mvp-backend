import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, BeforeInsert, OneToMany } from 'typeorm';
import { generateSlug } from 'src/shared/utils';
import { BranchStatus } from './type/branch-status.enum';
import { EntityTimestamp } from 'src/shared/entity/timestamp';
import { Address } from 'src/address/address.entity';
import { User } from 'src/user/user.entity';
import { Employment } from 'src/employment/employment.entity';

@Entity({ name: 'branches' })
export class Branch extends EntityTimestamp {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Index({ unique: true })
  @Column()
  public slug: string;

  @Column('smallint', { default: BranchStatus.ACTIVE })
  public status: BranchStatus;

  @Index()
  @Column({ nullable: true, default: false })
  public isHeadquater: boolean;

  @Column({ nullable: true, length: 250 })
  public cover: string;

  @Column({ nullable: true, length: 250 })
  public picture: string;

  @Column({ nullable: true, length: 500 })
  public name: string;

  @Column({ nullable: true, length: 250 })
  public designation: string;

  @Column({ nullable: true, length: 5000 })
  public description: string;

  @Column({ nullable: true, length: 250 })
  public email: string;

  @Column({ nullable: true, length: 50 })
  public phone: string;

  @Column({ nullable: true, length: 500 })
  public website: string;

  @Column('date', { nullable: true })
  public foundedAt: Date;

  @Column({ nullable: true })
  public size: number;

  @Column({ nullable: true })
  public totalPermanents: number;

  @Column({ nullable: true })
  public totalInterns: number;

  @Index()
  @Column('uuid', { nullable: true })
  public companyId: string;

  @Column('uuid', { nullable: true })
  public createdById: string;

  @OneToMany(() => Address, address => address.branch, { cascade: true })
  public addresses: Address[];

  @ManyToOne(() => User, company => company.branches)
  @JoinColumn({ name: 'companyId' })
  public company: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  public createdBy: User;

  @OneToMany(() => Employment, userComp => userComp.branch, { cascade: true })
  public staffs: Employment[];

  @BeforeInsert()
  public beforeInsert(): void {
    this.slug = generateSlug();
  }
}
