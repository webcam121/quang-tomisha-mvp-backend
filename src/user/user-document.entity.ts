import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { DocumentGroup } from './type/document-group.enum';
import { Branch } from 'src/branch/branch.entity';

@Entity({ name: 'user-documents' })
export class UserDocument {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column('uuid', { nullable: true })
  public userId: string;

  @Column('uuid', { nullable: true })
  public branchId: string;

  @Column('smallint', { nullable: true })
  public group: DocumentGroup;

  @Column('smallint', { nullable: true })
  public type: number;

  @Column({ length: 250, nullable: true })
  public front: string;

  @Column({ length: 250, nullable: true })
  public back: string;

  @Column('date', { nullable: true })
  public issuedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  public user: User;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branchId' })
  public branch: Branch;
}
