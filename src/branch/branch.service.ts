import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { Branch } from './branch.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindBranchesDto, CreateBranchDto, UpdateBranchDto } from './dto';
import { BranchStatus } from './type/branch-status.enum';
import { CompanyService } from 'src/company/company.service';
import { EmploymentRole } from 'src/employment/type/employment-role.enum';
import { Employment } from 'src/employment/employment.entity';
import { EmploymentService } from 'src/employment/employment.service';
import { EmploymentPermission } from 'src/employment/type/employment-permission.enum';
import { SubscriptionService } from 'src/subscription/subscription.service';
import * as dayjs from 'dayjs';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    public branchRepo: Repository<Branch>,
    private companyService: CompanyService,
    @Inject(forwardRef(() => EmploymentService))
    private employmentService: EmploymentService,
    private subscriptionService: SubscriptionService,
  ) {}

  public findMyHeadquaters(authUserId: string): Promise<Branch[]> {
    return this.branchRepo.createQueryBuilder('branch')
      .innerJoin('branch.staffs', 'staff')
      .innerJoin('branch.addresses', 'address')
      .where('branch.isHeadquater')
      .andWhere('staff.userId = :userId', { userId: authUserId })
      .andWhere('staff.role != :employeeRole', { employeeRole: EmploymentRole.EMPLOYEE })
      .select(['branch', 'address'])
      .getMany();
  }

  public find(findBranchesDto: FindBranchesDto): Promise<Branch[]> {
    const { name, country, city, companyId, type } = findBranchesDto;

    const qb = this.branchRepo
      .createQueryBuilder('branch')
      .innerJoinAndMapOne('branch.address', 'branch.addresses', 'address')
      .where('branch.status = :status', { status: BranchStatus.ACTIVE });

    if (type) {
      qb
        .innerJoin('branch.company', 'company')
        .andWhere('company.type = :type', { type });
    }

    if (companyId) {
      qb.andWhere('branch.companyId = :companyId', { companyId }).take(100);
    } else {
      qb.take(25);
    }

    if (name) {
      qb.andWhere('LOWER(branch.name) LIKE :name', { name: `%${name.toLowerCase()}%` });
    }

    if (country) {
      qb.andWhere('LOWER(address.country) = LOWER(:country)', { country })
    }

    if (city) {
      qb.andWhere('LOWER(address.city) = LOWER(:city)', { city })
    }

    return qb
      .select([
        'branch.id',
        'branch.companyId',
        'branch.isHeadquater',
        'branch.designation',
        'branch.slug',
        'branch.status',
        'branch.picture',
        'branch.cover',
        'branch.description',
        'branch.name',
        'address',
      ])
      .getMany();
  }

  public findOne(slug: string): Promise<Branch> {
    return this.branchRepo.findOneOrFail({ where: { slug }, relations: ['addresses', 'staffs', 'staffs.user'] });
  }

  public async create(createBranchDto: CreateBranchDto, authUserId: string): Promise<Branch> {
    const { token, address, ...branchDto } = createBranchDto;

    if (address) {
      Object.assign(branchDto, { addresses: [address] });
    }

    const branch = this.branchRepo.create(branchDto);
    branch.createdById = authUserId;

    if (token && !branchDto.companyId) {
      const company = await this.companyService.create(token, authUserId);
      branch.companyId = company.id;
      branch.company = company;
      branch.isHeadquater = true;

      // 1 free month and 3 free job ads for new company
      const startAt = dayjs().toDate()
      this.subscriptionService.subscriptionRepo.insert([
        {
          companyId: company.id,
          jobAmount: 1,
          remainingJobs: 1,
          total: 0,
          startAt,
          endAt: dayjs().add(1, 'year').toDate(),
        },
        {
          companyId: company.id,
          planId: 'trial',
          total: 0,
          startAt,
          endAt: dayjs().add(1, 'month').toDate(),
        },
      ]);

      // Create default admin staff
      branch.staffs = [{
        userId: authUserId,
        companyId: company.id,
        role: EmploymentRole.ADMIN,
      } as Employment];
    } else if (branch.companyId) {
      await this.employmentService.verifyPermission(authUserId, branch.companyId, EmploymentPermission.CREATE_BRANCH);
    }

    if (!branch.companyId) {
      throw new BadRequestException();
    }

    if (branch.isHeadquater) {
      await this.branchRepo.update({ companyId: branch.companyId, isHeadquater: true }, { isHeadquater: false });
    }

    const newBranch = await this.branchRepo.save(branch);
    if (newBranch.addresses) {
      newBranch['address'] = newBranch.addresses[0] || null;
      delete newBranch.addresses;
    }

    return newBranch;
  }

  public async update(id: string, updateBranchDto: UpdateBranchDto): Promise<Branch> {
    const branch = await this.branchRepo.findOneOrFail({ id });

    if (!branch.isHeadquater && updateBranchDto.isHeadquater) {
      await this.branchRepo.update({ companyId: branch.companyId, isHeadquater: true }, { isHeadquater: false });
    }

    const { address, ...payload } = updateBranchDto;
    if (address) {
      Object.assign(payload, { addresses: [address] })
    }
    Object.assign(branch, payload, {
      isHeadquater: branch.isHeadquater || !!updateBranchDto.isHeadquater,
    });

    const newBranch = await this.branchRepo.save(branch);
    if (newBranch.addresses) {
      newBranch['address'] = newBranch.addresses[0] || null;
      delete newBranch.addresses;
    }

    return newBranch;
  }
}
