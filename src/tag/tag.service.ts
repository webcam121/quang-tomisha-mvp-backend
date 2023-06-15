import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { FindTagsDto } from './dto';
import { Tag } from './tag.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  public find (findTagsDto: FindTagsDto): Promise<{ total: number, items: Tag[] }> {
    const {
      skip = 0,
      take = 50,
      order = 'title',
      asc = true,
      title,
      ...where
    } = findTagsDto;

    if (title) {
      Object.assign(where, { title: Raw(alias => `LOWER(${alias}) Like '%${title}%'`) });
    }

    return this.tagRepository.findAndCount({
      where,
      select: ['id', 'title'],
      order: {
        [order]: asc ? 'ASC' : 'DESC',
      },
      skip,
      take,
    }).then(([ items = [], total ]) => ({ items, total }));
  }
}
