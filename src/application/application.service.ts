import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Application } from './application.entity';
import { CreateApplicationDto, CreateApplicationLogDto, FindApplicationsDto } from './dto';
import { AuthService } from 'src/auth/auth.service';
import { UserStatus } from 'src/user/type/user-status.enum';
import { EmploymentService } from 'src/employment/employment.service';
import { JobService } from 'src/job/job.service';
import { EmploymentPermission } from 'src/employment/type/employment-permission.enum';
import { JobLogAction } from 'src/job-log/type/job-log-action.enum';
import { JobLogService } from 'src/job-log/job-log.service';
import { JobLog } from 'src/job-log/job-log.entity';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    public applicationRepo: Repository<Application>,
    private authService: AuthService,
    private employmentService: EmploymentService,
    private jobService: JobService,
    private jobLogService: JobLogService,
  ) {}

  public findMyApplications(authUserId: string): Promise<{ items: Application[], total: number }> {
    return this.applicationRepo
      .createQueryBuilder('ap')
      .innerJoin('ap.job', 'job')
      .innerJoin('ap.occupation', 'oc')
      .innerJoin('oc.profession', 'prof')
      .innerJoin('job.branch', 'bran')
      .innerJoinAndMapOne('bran.address', 'bran.addresses', 'addr')
      .leftJoin('ap.logs', 'log')
      .where('ap.userId = :authUserId', { authUserId })
      // .andWhere(qb =>
      //   'NOT EXISTS ' + qb.subQuery()
      //     .select('jlog.id')
      //     .from(JobLog, 'jlog')
      //     .where('jlog.applicationId = ap.id')
      //     .where('jlog.status >= :yesAction', { yesAction: JobLogAction.YES })
      //     .getQuery()
      // )
      .select([
        'ap.id',
        'ap.occupationId',
        'ap.updatedAt',
        'ap.createdAt',
        'oc.id',
        'oc.slug',
        'prof.title',
        'job.id',
        'job.title',
        'job.slug',
        'bran.id',
        'bran.name',
        'bran.status',
        'bran.picture',
        'addr.zip',
        'addr.city',
        'log',
      ])
      .orderBy('ap.updatedAt', 'DESC')
      .take(5)
      .getManyAndCount()
      .then(([items, total]) => ({ items, total }));
  }

  public async findApplicationsByJobId(findApplicationsDto: FindApplicationsDto, authUserId: string): Promise<{ items: Application[], total: number}> {
    const { jobId, companyId, status } = findApplicationsDto;

    await this.employmentService.verifyPermission(authUserId, companyId, EmploymentPermission.VIEW_APPLICATION);

    const qb = this.applicationRepo
      .createQueryBuilder('ap')
      .innerJoin('ap.occupation', 'oc')
      .innerJoin('oc.profession', 'prof')
      .innerJoin('ap.user', 'user')
      .where('ap.jobId = :jobId', { jobId })
      .andWhere('ap.companyId = :companyId', { companyId })

    if (status) {
      qb.innerJoin('ap.logs', 'log', 'log.action = :status', { status });
    } else {
      qb.leftJoin('ap.logs', 'log')
        .andWhere(
          qb => 'NOT EXISTS ' + qb.subQuery()
            .select('joblog.id')
            .from(JobLog, 'joblog')
            .where('joblog.applicationId = ap.id')
            .andWhere('joblog.action >= :yesAction', { yesAction: JobLogAction.YES })
            .getQuery()
        );
    }

    return qb
      .select([
        'ap.id',
        'ap.updatedAt',
        'ap.createdAt',
        'log',
        'prof.id',
        'prof.title',
        'oc.id',
        'oc.shortDescription',
        'user.id',
        'user.picture',
        'user.status',
        'user.slug',
        'user.firstName',
        'user.lastName',
      ])
      .orderBy('ap.updatedAt', 'DESC')
      .take(100)
      .getManyAndCount()
      .then(([items, total]) => ({ items, total }));
  }

  public async findOne(id: number, authUserId: string, companyId?: string): Promise<Application> {
    if (companyId) {
      await this.employmentService.verifyPermission(authUserId, companyId, EmploymentPermission.VIEW_APPLICATION);
    }

    const qb = this.applicationRepo
      .createQueryBuilder('ap')
      .innerJoin('ap.user', 'user')
      .leftJoinAndMapOne('user.address', 'user.addresses', 'addr')
      .innerJoin('ap.job', 'job')
      .innerJoin('job.branch', 'bran')
      .leftJoinAndMapOne('bran.address', 'bran.addresses', 'baddr')
      .innerJoin('job.staff', 'staf')
      .innerJoin('staf.user', 'suser')
      .leftJoin('staf.branch', 'sbran')
      .leftJoin('staf.profession', 'sprof')
      .select([
        'ap.id',
        'ap.occupationId',
        'user.id',
        'user.slug',
        'user.status',
        'user.picture',
        'user.firstName',
        'user.lastName',
        'user.phone',
        'addr.city',
        'addr.zip',
        'staf.id',
        'suser.id',
        'suser.slug',
        'suser.status',
        'suser.picture',
        'suser.firstName',
        'suser.lastName',
        'sbran.name',
        'sprof.title',
        'job.id',
        'job.slug',
        'job.title',
        'bran.id',
        'bran.picture',
        'bran.status',
        'bran.name',
        'baddr.city',
        'baddr.zip',
      ])
      .where('ap.id = :id', { id });

    if (companyId) {
      qb.andWhere('ap.companyId = :companyId', { companyId });
    } else {
      qb.andWhere('ap.userId = :authUserId', { authUserId });
    }

    const application = await qb.getOne();

    if (!application) {
      throw new NotFoundException();
    }

    return application;
  }

  public async create({ password, ...createApplicationDto }: CreateApplicationDto, authUserId: string): Promise<Application> {
    await this.authService.verifyPassword(authUserId, password);

    const [job] = await Promise.all([
      this.jobService.jobRepo.findOneOrFail({ where: { id: createApplicationDto.jobId }, select: ['companyId'] }),

      this.applicationRepo
        .createQueryBuilder('ap')
        .where('ap.userId = :authUserId', { authUserId })
        .andWhere('ap.jobId = :jobId', { jobId: createApplicationDto.jobId })
        .andWhere(
          qb => 'NOT EXISTS ' + qb
            .subQuery()
            .select('jlog.id')
            .from(JobLog, 'jlog')
            .where('jlog.applicationId = ap.id')
            .andWhere('jlog.action > :yesAction', { yesAction: JobLogAction.YES })
            .getQuery()
        )
        .select('ap.id')
        .getRawOne()
        .then((ap) => {
          if (ap) {
            throw new BadRequestException('Already applied')
          }
        }),
    ]);

    const application = this.applicationRepo.create(createApplicationDto);
    application.userId = authUserId;
    application.companyId = job.companyId;

    return this.applicationRepo.save(application);
  }

  public async createApplicationLog(createApplicationLogDto: CreateApplicationLogDto, authUserId: string): Promise<void> {
    const { action, applicationId, applicationIds = [], password } = createApplicationLogDto;
    if (action === JobLogAction.NO) {
      await this.authService.verifyPassword(authUserId, password);
    }

    const ids = applicationIds.concat(applicationId).filter(Boolean);
    const isUser = action === JobLogAction.DELETE;

    const qb = this.applicationRepo
      .createQueryBuilder('ap')
      .leftJoin('ap.logs', 'log')
      .select(['ap.id', 'ap.companyId', 'ap.userId', 'log.id', 'log.action'])
      .where('ap.id IN (:...ids)', { ids });

    if (isUser) {
      qb.andWhere('ap.userId = :authUserId', { authUserId });
    }

    let companyId = null;
    const applications = await qb.getMany()
      .then((applications) => applications.filter((ap) => {
        const valid = !ap.logs?.some?.(log => log.action === action || log.action >= JobLogAction.YES);
        if (isUser) {
          return valid;
        } else if (!companyId) {
          companyId = ap.companyId;
        } else if (ap.companyId !== companyId) {
          return false;
        }
        return valid;
      }));

    if (!applications.length) {
      throw new BadRequestException('Unable to change application status');
    }

    if (!isUser) {
      await this.employmentService.verifyPermission(authUserId, companyId, EmploymentPermission.VIEW_APPLICATION);
    }

    this.applicationRepo.update({ id: In(applications.map(a => a.id)) }, { updatedAt: new Date() });

    await this.jobLogService.jobLogRepo.insert(ids.map(applicationId => ({ applicationId, action, userId: isUser ? authUserId : companyId })));
  }
}
