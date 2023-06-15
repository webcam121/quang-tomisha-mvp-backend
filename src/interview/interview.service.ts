import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplicationService } from 'src/application/application.service';
import { JobLog } from 'src/job-log/job-log.entity';
import { JobLogService } from 'src/job-log/job-log.service';
import { JobLogAction } from 'src/job-log/type/job-log-action.enum';
import { EmploymentService } from 'src/employment/employment.service';
import { EmploymentPermission } from 'src/employment/type/employment-permission.enum';
import { UserStatus } from 'src/user/type/user-status.enum';
import { In, Repository } from 'typeorm';
import { CreateInterviewDto, CreateInterviewLogDto, FindInterviewsDto } from './dto';
import { Interview } from './interview.entity';

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(Interview)
    private interviewRepo: Repository<Interview>,
    private employmentService: EmploymentService,
    private applicationService: ApplicationService,
    private jobLogService: JobLogService,
  ) {}

  public async findMyInterviews(authUserId: string): Promise<{ items: Interview[], total: number }> {
    return this.interviewRepo
      .createQueryBuilder('in')
      .innerJoin('in.job', 'job')
      .innerJoin('job.profession', 'prof')
      .innerJoin('job.branch', 'bran')
      .innerJoinAndMapOne('bran.address', 'bran.addresses', 'addr')
      .where('in.userId = :authUserId', { authUserId })
      .andWhere(qb =>
        'NOT EXISTS ' + qb.subQuery()
          .select('log.id')
          .from(JobLog, 'log')
          .where('log.interviewId = in.id')
          .andWhere('log.action >= :yesAction', { yesAction: JobLogAction.YES })
          .getQuery()
      )
      .select([
      'in.id',
      'in.updatedAt',
      'prof.id',
      'prof.title',
      'job.id',
      'job.title',
      'bran.id',
      'bran.name',
      'bran.status',
      'bran.picture',
      'addr.zip',
      'addr.city',
    ])
    .orderBy('in.updatedAt', 'DESC')
    .getManyAndCount()
    .then(([items, total]) => ({ items, total }));
  }

  public async find(findInterviewsDto: FindInterviewsDto, authUserId: string): Promise<{ items: Interview[], total: number}> {
    const { jobId, companyId, status } = findInterviewsDto;

    await this.employmentService.verifyPermission(authUserId, companyId, EmploymentPermission.VIEW_APPLICATION);

    const qb = this.interviewRepo
      .createQueryBuilder('in')
      .innerJoin('in.application', 'ap')
      .innerJoin('ap.occupation', 'oc')
      .innerJoin('oc.profession', 'prof')
      .innerJoin('in.user', 'user')
      .innerJoin('in.job', 'job')
      .where('in.companyId = :companyId', { companyId })

    if (jobId) {
      qb.andWhere('in.jobId = :jobId', { jobId })
    }

    if (status) {
      qb.innerJoin('in.logs', 'log', 'log.action = :status', { status });
    } else {
      qb.leftJoin('in.logs', 'log');
    }

    return qb
      .select([
        'in.id',
        'in.updatedAt',
        'in.createdAt',
        'log',
        'prof.title',
        'ap.id',
        'oc.id',
        'oc.shortDescription',
        'job.id',
        'job.title',
        'user.id',
        'user.picture',
        'user.status',
        'user.slug',
        'user.firstName',
        'user.lastName',
      ])
      .orderBy('in.updatedAt', 'DESC')
      .take(100)
      .getManyAndCount()
      .then(([items, total]) => ({ items, total }));
  }

  public async findOne(id: number, authUserId: string, companyId?: string): Promise<Interview> {
    if (companyId) {
      await this.employmentService.verifyPermission(authUserId, companyId, EmploymentPermission.VIEW_APPLICATION);
    }

    const qb = this.interviewRepo
      .createQueryBuilder('in')
      .innerJoin('in.job', 'job')
      .innerJoin('job.branch', 'jbran')
      .leftJoinAndMapOne('jbran.address', 'jbran.addresses', 'jadd')
      .innerJoin('job.profession', 'prof')
      .innerJoin('in.application', 'ap')
      .innerJoin('in.user', 'user')
      .innerJoin('in.branch', 'bran')
      .leftJoinAndMapOne('bran.address', 'bran.addresses', 'badd')
      .innerJoin('in.staff', 'staf')
      .leftJoin('staf.user', 'suser')
      .leftJoin('staf.profession', 'sprof')
      .leftJoin('staf.branch', 'sbran')
      .leftJoin('in.logs', 'log')
      .select([
        'in.id',
        'in.message',
        'in.startAt',
        'in.createdAt',
        'job.id',
        'job.slug',
        'job.title',
        'prof.id',
        'prof.title',
        'jbran.id',
        'jbran.status',
        'jbran.picture',
        'jbran.name',
        'jadd.zip',
        'jadd.city',
        'log',
        'ap.id',
        'ap.occupationId',
        'bran.id',
        'bran.slug',
        'bran.picture',
        'bran.status',
        'bran.name',
        'badd.zip',
        'badd.city',
        'staf.id',
        'suser.id',
        'suser.slug',
        'suser.picture',
        'suser.status',
        'suser.firstName',
        'suser.lastName',
        'sprof.id',
        'sprof.title',
        'sbran.name',
        'user.id',
        'user.slug',
        'user.status',
        'user.picture',
        'user.firstName',
        'user.lastName',
      ])
      .where('in.id = :id', { id });

    if (companyId) {
      qb.andWhere('in.companyId = :companyId', { companyId });
    } else {
      qb.andWhere('in.userId = :authUserId', { authUserId });
    }

    const interview = await qb.getOne();

    if (!interview) {
      throw new NotFoundException();
    }

    return interview;
  }

  public async create(createInterviewDto: CreateInterviewDto, authUserId: string): Promise<Interview> {
    const [application] = await Promise.all([
      this.applicationService.applicationRepo.findOneOrFail({
        where: {
          id: createInterviewDto.applicationId,
          companyId: createInterviewDto.companyId
        },
        select: ['id', 'jobId', 'userId']
      }),

      this.employmentService.verifyPermission(authUserId, createInterviewDto.companyId),

      this.interviewRepo
        .createQueryBuilder('in')
        .select('in.id')
        .where('in.applicationId = :applicationId', { applicationId: createInterviewDto.applicationId })
        .andWhere(
          qb => 'NOT EXISTS ' + qb
            .subQuery()
            .select('jlog.id')
            .from(JobLog, 'jlog')
            .where('jlog.interviewId = in.id')
            .andWhere('jlog.action >= :yesAction', { yesAction: JobLogAction.YES })
            .getQuery()
        )
        .getRawOne()
        .then((interview) => {
          if (interview) {
            throw new BadRequestException('Interview already exists');
          }
        }),
    ]);

    const interview = this.interviewRepo.create(createInterviewDto);
    interview.userId = application.userId;
    interview.jobId = application.jobId;

    const newInterview = await this.interviewRepo.save(interview);

    this.jobLogService.jobLogRepo.insert({ applicationId: application.id, action: JobLogAction.YES, userId: createInterviewDto.companyId });

    return newInterview
  }

  public async createInterviewLog(createInterviewLogDto: CreateInterviewLogDto, authUserId: string): Promise<void> {
    const { action, interviewId, interviewIds = [] } = createInterviewLogDto;
    const ids = interviewIds.concat(interviewId).filter(Boolean);
    const isCompany = action === JobLogAction.DELETE;

    const qb = this.interviewRepo
      .createQueryBuilder('in')
      .leftJoinAndMapOne('in.log', 'in.logs', 'log', 'log.action >= :yesAction', { yesAction: JobLogAction.YES })
      .select(['in.id', 'in.companyId', 'in.userId', 'log.id', 'log.action'])
      .where('in.id IN (:...ids)', { ids });

    if (!isCompany) {
      qb.andWhere('in.userId = :authUserId', { authUserId });
    }

    const interviews = await qb.getMany()
      .then((interviews) => interviews.filter((interview) => {
        return !interview.logs?.some?.(log => log.action === action || log.action >= JobLogAction.YES);
      }));

    if (!interviews.length) {
      throw new BadRequestException('Unable to change interview status');
    }

    if (isCompany) {
      await Promise.all(Array.from(new Set(interviews.map(i => i.companyId))).map(
        companyId => this.employmentService.verifyPermission(authUserId, companyId, EmploymentPermission.VIEW_APPLICATION)
      ));
    }

    this.interviewRepo.update({ id: In(interviews.map(i => i.id)) }, { updatedAt: new Date() });

    const jobLogs = interviews.map(interview => ({ interviewId, action, userId: isCompany ? interview.companyId : authUserId }));

    await this.jobLogService.jobLogRepo.insert(jobLogs);
  }
}
