import { MigrationInterface, getConnectionManager } from 'typeorm';

import { Tag } from 'src/tag/tag.entity';
import { TagType } from 'src/tag/type/tag-type.enum';
import { User } from 'src/user/user.entity';

const hobbies = require('./data/hobbies.json');
const hardSkills = require('./data/hard-skills.json');
const professions = require('./data/professions.json');

export class Init1613273718350 implements MigrationInterface {
  public async up(): Promise<void> {
      const manager = getConnectionManager().get('seed').createEntityManager();

      const tags = hobbies
        .map((title) => ({ type: TagType.HOBBY, title }))
        .concat(hardSkills.map((title) => ({ type: TagType.HARD_SKILL, title })))
        .concat(professions.map((title) => ({ type: TagType.PROFESSION, title })));

      await manager.save(manager.create(Tag, tags));

      await manager.save(manager.create(User, {
        email: 'admin@tomisha.com',
        password: '8t9da234',
        firstName: 'Tomisha',
        lastName: 'Admin',
        isAdmin: true,
      }));
  }

  public async down(): Promise<void> {
      const manager = getConnectionManager().get('seed').createEntityManager();

      await manager.clear(Tag);
  }
}
