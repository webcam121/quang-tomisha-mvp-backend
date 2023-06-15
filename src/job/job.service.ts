import * as dayjs from 'dayjs';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { Job } from './job.entity';
import { CreateJobDto, FindJobsDto, UpdateJobDto } from './dto';
import { JobStatus } from './type/job-status.enum';
import { EmploymentService } from 'src/employment/employment.service';
import { EmploymentPermission } from 'src/employment/type/employment-permission.enum';
import { Application } from 'src/application/application.entity';
import { OccupationService } from 'src/occupation/occupation.service';
import { SubscriptionService } from 'src/subscription/subscription.service';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    public jobRepo: Repository<Job>,
    private employmentService: EmploymentService,
    private occupationService: OccupationService,
    private subscriptionService: SubscriptionService,
  ) {}

  public async findMyRecommendations(authUserId: string) {
    const professions = await this.occupationService.occupationRepo.find({
      where: { userId: authUserId },
      select: ['id'],
      relations: ['profession'],
    }).then((ocs) => ocs.map(oc => oc.profession));

    const now = dayjs().format('YYYY-MM-DD');

    const groups = await Promise.all(professions.map(async (profession) => {
      return {
        ...(await this.jobRepo.createQueryBuilder('job')
          .innerJoin('job.branch', 'branch')
          .leftJoinAndMapOne('branch.address', 'branch.addresses', 'address')
          .innerJoin('job.profession', 'profession')
          .select([
            'job.id',
            'job.slug',
            'job.title',
            'job.publishAt',
            'branch.name',
            'branch.picture',
            'address.city',
            'address.zip',
            'address.text',
            'profession.id',
            'profession.title',
          ])
          .where('job.professionId = :professionId', { professionId: profession.id })
          .andWhere('job.status = :openStatus', { openStatus: JobStatus.OPEN })
          .andWhere('job.public')
          .andWhere('job.publishAt <= :now', { now })
          .andWhere('job.endAt >= :now', { now })
          .orderBy('job.publishAt', 'DESC')
          .take(3)
          .getManyAndCount()
          .then(([items, total]) => ({ items, total }))),

        profession,
      }
    })).then(groups => groups.filter(g => g.items?.length));

    const qb = this.jobRepo.createQueryBuilder('job')
      .innerJoin('job.branch', 'branch')
      .leftJoinAndMapOne('branch.address', 'branch.addresses', 'address')
      .innerJoin('job.profession', 'profession')
      .where('job.status = :openStatus', { openStatus: JobStatus.OPEN })
      .andWhere('job.public')
      .andWhere('job.publishAt <= :now', { now })
      .andWhere('job.endAt >= :now', { now });

    if (groups.length) {
      qb.andWhere('job.id NOT IN (:...ids)', { ids: groups.reduce((arr, g) => arr.concat(g.items.map(item => item.id)), []) });
    }

    const newestJobs = await qb
      .select([
        'job.id',
        'job.slug',
        'job.title',
        'job.publishAt',
        'branch.name',
        'branch.picture',
        'address.city',
        'address.zip',
        'address.text',
        'profession.id',
        'profession.title',
      ])
      .orderBy('job.publishAt', 'DESC')
      .take(3)
      .getManyAndCount()
      .then(([items, total]) => ({ items, total }));

    return [
      ...groups,
      newestJobs,
    ].filter(g => g.items.length);
  }

  public async findCompanyJobs(companyId: string, authUserId: string): Promise<{ items: Job[], total: number }> {
    await this.employmentService.verifyPermission(authUserId, companyId)

    return this.jobRepo
      .createQueryBuilder('job')
      .innerJoin('job.profession', 'prof')
      .innerJoin('job.branch', 'bran')
      .leftJoinAndMapOne('bran.address', 'bran.addresses', 'addr')
      .where('job.companyId = :companyId', { companyId })
      .select([
        'job.id',
        'job.title',
        'prof.title',
        'prof.id',
        'job.updatedAt',
        'job.publishAt',
        'bran.id',
        'bran.status',
        'bran.name',
        'bran.picture',
        'addr',
      ])
      .orderBy('job.updatedAt', 'DESC')
      .getManyAndCount()
      .then(([items, total]) => ({ items, total }));
  }

  public find(findJobsDto: FindJobsDto): Promise<{ items: Job[], total: number }> {
    const {
      companyId,
      branchIds = [],
      order = 'publishAt',
      asc = false,
      skip = 0,
      take = 3,
      title,
      sizes = [],
      relationships = [],
      professionId,
      minWorkload,
      maxWorkload,
      lng,
      lat,
      miles = 50,
    } = findJobsDto;

    const now = dayjs().format('YYYY-MM-DD');

    const qb = this.jobRepo
      .createQueryBuilder('job')
      .innerJoin('job.branch', 'branch')
      .leftJoinAndMapOne('branch.address', 'branch.addresses', 'address')
      .innerJoin('job.profession', 'profession')
      .where('job.status = :openStatus', { openStatus: JobStatus.OPEN })
      .andWhere('job.public')
      .andWhere('job.publishAt <= :now', { now })
      .andWhere('job.endAt >= :now', { now })
      .select([
        'job.id',
        'job.slug',
        'job.title',
        'job.publishAt',
        'branch.name',
        'branch.picture',
        'address',
        'profession.id',
        'profession.title',
      ])
      .skip(skip)
      .take(take)
      .orderBy(`job.${order}`, asc ? 'ASC' : 'DESC');

    if (companyId) {
      qb.andWhere('job.companyId = :companyId', { companyId });
    }

    if (branchIds?.length) {
      qb.andWhere('job.branchId IN (:...branchIds)', { branchIds });
    }

    if (title) {
      qb.andWhere('LOWER(job.title) LIKE :title', { title: `%${title.toLowerCase()}%` });
    }

    if (relationships?.length) {
      qb.andWhere('job.relationships && :relationships', { relationships });
    }

    if (professionId) {
      qb.andWhere('job.professionId = :professionId', { professionId });
    }

    if (minWorkload > 0) {
      qb.andWhere('job.minWorkload >= :minWorkload', { minWorkload });
    }

    if (maxWorkload < 100) {
      qb.andWhere('job.maxWorkload <= :maxWorkload', { maxWorkload });
    }

    if (sizes?.length) {
      const where = sizes.map(([min, max]) => {
        return `branch.size BETWEEN ${min} AND ${max}`
      }).join(' OR ');

      qb.andWhere(`(${where})`);
    }

    if (lng && lat) {
      qb
        .addSelect('point(address.lng, address.lat)<@>point(:lng, :lat)', 'distance')
        .andWhere('point(address.lng, address.lat)<@>point(:lng, :lat) < :miles')
        .setParameters({ lng, lat, miles })
        .orderBy('distance', 'ASC');
    }

    return qb.getManyAndCount()
      .then(([items, total]) => ({ items, total }));
  }

  // public findRecommendedJobs(authUserId: string): Promise<{ items: Job[], total: number }> {
  //   return this.jobRepo.createQueryBuilder('job')
  //     .innerJoin('job.branch', 'branch')
  //     .innerJoin('branch.addresses', 'address')
  //     .innerJoin('job.experiences', 'experience', 'experience.primary')
  //     .innerJoin('experience.profession', 'profession')
  //     .where('job.status = :openStatus', { openStatus: JobStatus.OPEN })
  //     .andWhere((qb) => {
  //       const sqb = qb
  //         .subQuery()
  //         .select('occupation.professionId')
  //         .from(Occupation, 'occupation')
  //         .where('occupation.userId = :authUserId', { authUserId })
  //         .getQuery();

  //       return 'job.professionId IN ' + sqb;
  //     })
  //     .orderBy('job.publishAt', 'DESC')
  //     .take(10)
  //     .getManyAndCount()
  //     .then(([items, total]) => ({ items, total }));
  // }

  public async findOne(slug: string, authUserId?: string): Promise<Job> {
    const qb = this.jobRepo
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.branch', 'branch')
      .leftJoinAndMapOne('branch.address', 'branch.addresses', 'baddress')
      .leftJoinAndSelect('job.staff', 'staff')
      .leftJoinAndSelect('staff.profession', 'stprof')
      .innerJoinAndSelect('staff.user', 'user')
      .leftJoinAndMapOne('user.address', 'user.addresses', 'address')
      .leftJoinAndSelect('job.skills', 'skill')
      .leftJoinAndSelect('skill.hardSkill', 'hskill')
      .leftJoinAndSelect('skill.profession', 'skprof')
      .leftJoinAndSelect('job.profession', 'profession')
      .where('job.slug = :slug', { slug })

    if (authUserId) {
      qb.leftJoinAndSelect(Application, 'ap', 'ap.jobId = job.id AND ap.userId = :authUserId', { authUserId })
        .addSelect('ap', 'application');
    }

    const job = await qb.getOne();

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  public async findOneById(id: string): Promise<Job> {
    const qb = this.jobRepo
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.branch', 'branch')
      .leftJoinAndMapOne('branch.address', 'branch.addresses', 'baddress')
      .leftJoinAndSelect('job.staff', 'staff')
      .innerJoinAndSelect('staff.user', 'user')
      .leftJoinAndMapOne('user.address', 'user.addresses', 'address')
      .leftJoinAndSelect('job.skills', 'skill')
      .leftJoinAndSelect('skill.hardSkill', 'hskill')
      .leftJoinAndSelect('skill.profession', 'sprof')
      .leftJoinAndSelect('job.profession', 'profession')
      .where('job.id = :id', { id })

    const job = await qb.getOne();

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  public async create(createJobDto: CreateJobDto, authUserId: string): Promise<Job> {
    await this.employmentService.verifyPermission(authUserId, createJobDto.companyId, EmploymentPermission.MUTATE_JOB);

    const planSub = await this.subscriptionService.subscriptionRepo.findOne({
      where: {
        planId: Not(IsNull),
        endAt: MoreThanOrEqual(dayjs().format('YYYY-MM-DD')),
      },
      select: ['id'],
    });

    if (!planSub) {
      throw new ForbiddenException('No valid subscription');
    }

    const [jobSub] = await this.subscriptionService.subscriptionRepo.find({
      where: {
        remainingJobs: MoreThan(0),
        endAt: MoreThanOrEqual(dayjs().format('YYYY-MM-DD')),
      },
      order: {
        endAt: 'DESC',
      },
      take: 1,
    });

    if (!jobSub) {
      throw new ForbiddenException('No valid subscription');
    }

    const job = this.jobRepo.create(createJobDto);
    job.createdById = authUserId;
    job.companyId = createJobDto.companyId;
    job.endAt = dayjs().add(3, 'month').toDate();

    const newJob = await this.jobRepo.save(job);

    this.subscriptionService.subscriptionRepo.update({ id: jobSub.id }, { remainingJobs: jobSub.remainingJobs - 1 });

    return newJob;
  }

  public async update(id: string, updateJobDto: UpdateJobDto): Promise<Job> {
    const newJob = this.jobRepo.create(updateJobDto);
    newJob.id = id;

    return this.jobRepo.save(newJob);
  }
}
