import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import dayjs = require('dayjs');
import { BranchService } from 'src/branch/branch.service';
import { EmploymentRole } from 'src/employment/type/employment-role.enum';
import { parseJSON } from 'src/shared/utils';
import { SubscriptionService } from 'src/subscription/subscription.service';
import { UserType } from 'src/user/type/user-type.enum';
import { UserService } from 'src/user/user.service';
import { In, Not, Repository } from 'typeorm';
import { CreateSupportDto, FindSupportsDto, PatchSupportsDto } from './dto';
import { Support } from './support.entity';
import { SupportStatus } from './type/support-status.enum';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(Support)
    public supportRepo: Repository<Support>,
    private mailService: MailerService,
    private userService: UserService,
    private branchService: BranchService,
    private subscriptionService: SubscriptionService,
    private configService: ConfigService,
  ) {}

  public find(findSupportsDto: FindSupportsDto): Promise<{ items: Support[], total: number }> {
    const { order, asc, skip, take } = findSupportsDto;

    return this.supportRepo.findAndCount({
      relations: ['createdBy'],
      order: {
        [order]: asc ? 'ASC' : 'DESC'
      },
      skip,
      take
    }).then(([ items = [], total ]) => ({ items, total }));
  }

  public async create(createSupportDto: CreateSupportDto, authUserId: string): Promise<void> {
    const { address, email, ...info } = createSupportDto;

    const user = await this.userService.userRepo.findOne({ where: { email }, select: ['id', 'firstName', 'lastName'] });
    if (user) {
      throw new BadRequestException('Überprüfe, ob du die E-Mail-Adresse korrekt eingeben hast');
    }

    const receiver = await this.userService.userRepo.findOne({ where: { id: authUserId } })

    const support = this.supportRepo.create(info);
    support.email = email;

    if (address) {
      support.address = JSON.stringify(address);
    }

    if (authUserId) {
      support.createdById = authUserId;
    }

    const addrComps = parseJSON(address?.components);

    await Promise.all([
        this.mailService.sendMail({
        to: email,
        template: 'support-no-domain',
        subject: 'Supportanfrage Domain',
        context: {
          receiverName: [receiver.firstName, receiver.lastName].filter(Boolean).join(' '),
          info: {
            ...info,
            email,
            street: [addrComps?.route?.long, addrComps?.street_number?.long]
              .filter(Boolean)
              .join(' '),
            city: [address?.zip, address?.city].filter(Boolean).join(' '),
            country: addrComps?.country?.long,
          }
        }
      }),

      this.supportRepo.save(support),
    ]);

  }

  public async patch({ ids, status }: PatchSupportsDto): Promise<void> {
    if (status === SupportStatus.APPROVED) {
      const unapprovedSupports = await this.supportRepo.find({
        where: {
          id: In(ids),
          status: Not(SupportStatus.APPROVED),
        },
        relations: ['createdBy'],
      });

      if (!unapprovedSupports.length) {
        return;
      }

      await Promise.all(unapprovedSupports.map(async (support) => {
        const company = this.userService.userRepo.create({
          email: support.email,
          type: support.createdBy.type === UserType.AGENT ? UserType.AGENCY : UserType.COMPANY,
        });

        const newCompany = await this.userService.userRepo.save(company);

        const branch = this.branchService.branchRepo.create({
          companyId: newCompany.id,
          isHeadquater: true,
          name: support.name,
          addresses: support.address ? [parseJSON(support.address)] : [],
          website: support.website,
          staffs: [{
            userId: support.createdBy.id,
            companyId: newCompany.id,
            role: EmploymentRole.ADMIN,
          }],
        });

        await this.branchService.branchRepo.save(branch);

        // 1 free month and 3 free job ads for new company
        const startAt = dayjs().toDate()
        this.subscriptionService.subscriptionRepo.insert([
          {
            companyId: newCompany.id,
            jobAmount: 1,
            remainingJobs: 1,
            total: 0,
            startAt,
            endAt: dayjs().add(1, 'year').toDate(),
          },
          {
            companyId: newCompany.id,
            planId: 'trial',
            total: 0,
            startAt,
            endAt: dayjs().add(1, 'month').toDate(),
          },
        ]);

        await this.mailService.sendMail({
          to: support.createdBy.email,
          template: 'support-no-domain-done',
          subject: 'Supportanfrage Domain',
          context: {
            receiverName: [support.createdBy.firstName, support.createdBy.lastName].filter(Boolean).join(' '),
            href: this.configService.get('webAppDomain') + 'edit/company',
          },
        });
      }));
    }

    await this.supportRepo.update({ id: In(ids) }, { status });
  }
}
