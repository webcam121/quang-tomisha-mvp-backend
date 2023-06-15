import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDegreeDto, UpdateDegreeDto } from './dto';
import { Degree } from './degree.entity';
import { DegreeType } from './type/degree-type.enum';

@Injectable()
export class DegreeService {
  constructor(
    @InjectRepository(Degree)
    private degreeRepo: Repository<Degree>,
  ) {}

  public find(type: DegreeType, authUserId: string): Promise<Degree[]> {
    return this.degreeRepo.createQueryBuilder('deg')
      .leftJoin('deg.files', 'file')
      .leftJoin('deg.branch', 'bran')
      .leftJoinAndMapOne('bran.address', 'bran.addresses', 'baddr')
      .where('deg.type = :type', { type })
      .andWhere('deg.userId = :authUserId', { authUserId })
      .select([
        'deg',
        'bran.id',
        'bran.status',
        'bran.slug',
        'bran.name',
        'bran.picture',
        'bran.cover',
        'baddr.city',
        'baddr.zip',
        'file',
      ])
      .getMany();
  }

  public createDegree(createDegreeDto: CreateDegreeDto): Promise<Degree> {
    const degree = this.degreeRepo.create(createDegreeDto);
    return this.degreeRepo.save(degree);
  }

  public async updateDegree(id: number, updateDegreeDto: UpdateDegreeDto): Promise<Degree> {
    const degree = this.degreeRepo.create(updateDegreeDto);
    degree.id = id;
    return this.degreeRepo.save(degree);
  }

  public async removeDegree(id: number): Promise<void> {
    await this.degreeRepo.delete(id);
  }
}
