import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class EntityTimestamp {
  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
