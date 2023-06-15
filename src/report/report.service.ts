import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateReportDto, FindReportsDto, PatchReportsDto } from './dto';
import { Report } from './report.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    public reportRepo: Repository<Report>,
  ) {}

  public find(findReportsDto: FindReportsDto): Promise<{ items: Report[], total: number }> {
    const { order, asc, skip, take } = findReportsDto;

    return this.reportRepo.findAndCount({
      relations: ['createdBy'],
      order: {
        [order]: asc ? 'ASC' : 'DESC'
      },
      skip,
      take
    }).then(([ items = [], total ]) => ({ items, total }));
  }

  public async create(createReportDto: CreateReportDto, authUserId: string): Promise<void> {
    const report = this.reportRepo.create(createReportDto);
    if (authUserId) {
      report.createdById = authUserId;
    }
    await this.reportRepo.save(report);
  }

  public async patch({ ids, ...dto }: PatchReportsDto): Promise<void> {
    await this.reportRepo.update({ id: In(ids) }, dto);
  }
}
