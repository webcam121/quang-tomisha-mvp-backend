import { Branch } from 'src/branch/branch.entity';
import { User } from 'src/user/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';

@Entity({ name: 'addresses' })
export class Address {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ length: 500 })
  public text: string;

  @Column({ length: 2 })
  public country: string;

  @Column({ length: 200, nullable: true })
  public city: string;

  @Column({ length: 16, nullable: true })
  public zip: string;

  @Column({ length: 500, nullable: true })
  public components: string;

  @Column('float8', { nullable: true })
  public lng: number;

  @Column('float8', { nullable: true })
  public lat: number;

  @Column('uuid', { nullable: true })
  public userId: string;

  @Column('uuid', { nullable: true })
  public branchId: string;

  @ManyToOne(() => User, user => user.addresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  public user: User;

  @ManyToOne(() => Branch, branch => branch.addresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branchId' })
  public branch: Branch;
}
