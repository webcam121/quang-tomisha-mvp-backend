import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateJobLogDto } from './dto';
import { JobLog } from './job-log.entity';

@Injectable()
export class JobLogService {
  constructor (
    @InjectRepository(JobLog)
    public jobLogRepo: Repository<JobLog>,
  ) {}

  public create(createJobLogDto: CreateJobLogDto): Promise<JobLog> {
    const jobLog = this.jobLogRepo.create(createJobLogDto);
    return this.jobLogRepo.save(jobLog);
  }
}
