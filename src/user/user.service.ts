import * as dayjs from 'dayjs';
import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { In, Repository } from 'typeorm';
import { User } from './user.entity';
import { DeactivateMeDto, SearchUserDto, SearchUsersDto, PatchMeDto, FindUserDto, PatchUsersDto } from './dto';
import { UserStatus } from './type/user-status.enum';
import { Contact } from 'src/contact/contact.entity';
import { AuthService } from 'src/auth/auth.service';
import { ReferenceService } from 'src/reference/reference.service';
import { UserType } from './type/user-type.enum';
import { Reference } from 'src/reference/reference.entity';
import { EmploymentRole } from 'src/employment/type/employment-role.enum';
import { ContactStatus } from 'src/contact/type/contact-status.enum';
import { EmploymentService } from 'src/employment/employment.service';
import { AuthUser } from 'src/auth/type/auth-user.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    public userRepo: Repository<User>,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private employmentService: EmploymentService,
    private mailerSerive: MailerService,
    private referenceService: ReferenceService,
  ) {}

  public async findOne(findUserDto: FindUserDto, authUser?: AuthUser): Promise<User> {
    const { id, slug, occupationId, occupationSlug } = findUserDto;

    const qb = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndMapOne('user.address', 'user.addresses', 'addr')
      .leftJoinAndSelect('user.softSkills', 'ss')
      .leftJoinAndSelect('user.hobbies', 'h')
      .leftJoinAndSelect('user.documents', 'd')
      .leftJoinAndSelect('d.branch', 'db')
      .leftJoinAndMapOne('db.address', 'db.addresses', 'dba')
      .loadRelationCountAndMap('user.referenceCount', 'user.references')
      .leftJoinAndSelect('user.degrees', 'deg')
      .leftJoinAndSelect('deg.branch', 'deb')
      .leftJoinAndMapOne('deb.address', 'deb.addresses', 'deba')
      .leftJoinAndSelect('user.branches', 'b') // If company
      .leftJoinAndMapOne('b.address', 'b.addresses', 'ba');

    if (occupationSlug) {
      qb.leftJoinAndSelect('user.occupations', 'oc', 'oc.slug = :occupationSlug', { occupationSlug });
    } else if (occupationId) {
      qb.leftJoinAndSelect('user.occupations', 'oc', 'oc.id = :occupationId', { occupationId });
    } else {
      qb.leftJoinAndSelect('user.occupations', 'oc');
    }

    qb
      .leftJoinAndSelect('oc.profession', 'opr')
      .leftJoinAndSelect('oc.hardSkills', 'ohs')
      .leftJoinAndSelect('ohs.skill', 'hs')
      .leftJoinAndSelect('oc.preferences', 'opf')
      .leftJoinAndSelect('oc.employments', 'oce')
      .leftJoinAndSelect('oce.files', 'ocef')
      .leftJoinAndSelect('oce.branch', 'oceb')
      .leftJoinAndMapOne('oceb.address', 'oceb.addresses', 'oceba');

    if (slug) {
      qb.where('user.slug = :slug', { slug });
    } else {
      qb.where('user.id = :id', { id });
    }

    if (!authUser?.isAdmin) {
      // TODO Better handle locked & deactivated users
      qb.andWhere('user.status NOT IN (:...inactiveStatuses)', { inactiveStatuses: [UserStatus.LOCKED, UserStatus.DEACTIVATED] });
    }

    qb
      .addSelect(
        sq => sq.select('COUNT(*)', 'contactCount')
          .from(Contact, 'cc')
          .where(('cc.userId = user.id OR cc.contactUserId = user.id')),
        'contactCount',
      )
      .addSelect(
        sq => sq.select('AVG(rating)', 'rating')
          .from(Reference, 'ref')
          .where('ref.userId = user.id'),
        'rating',
      );

    if (authUser) {
      qb
        .leftJoinAndSelect('user.files', 'f')
        .leftJoinAndSelect('deg.files', 'ef')
        .leftJoinAndSelect('oce.files', 'oef')
        .leftJoinAndMapOne('user.address', 'user.addresses', 'ua')
        .leftJoin(
          Contact,
          'c',
          '((c.userId = user.id AND c.contactUserId = :authUserId) OR (c.userId = :authUserId AND c.contactUserId = user.id))',
          { authUserId: authUser.id },
        )
        .andWhere(
          qb => 'NOT EXISTS ' + qb
          .subQuery()
          .select('bc.id')
          .from(Contact, 'bc')
          .where('bc.userId = user.id')
          .andWhere('bc.contactUserId = :authUserId', { authUserId: authUser.id })
          .andWhere('bc.status = :blockedStatus', { blockedStatus: ContactStatus.BLOCKED })
          .getQuery()
        )
        .addSelect('c.status', 'contactStatus');
    }

    const user = await qb.getOne();

    if (!user) {
      throw new NotFoundException();
    }

    if (!user.publicRef && user.type <= UserType.AGENT && authUser) {
      Object.assign(user, {
        canViewReferences: await this.referenceService.canView({ viewerId: authUser.id, userId: user.id }),
      });
    }

    return user;
  }

  public async findMe(authUserId: string): Promise<User> {
    return this.userRepo.createQueryBuilder('user')
    .where('user.id = :authUserId', { authUserId })
    .leftJoinAndMapOne('user.address', 'user.addresses', 'addr')
    .leftJoin('user.documents', 'doc')
    .leftJoin('doc.branch', 'docBranch')
    .leftJoinAndMapOne('docBranch.address', 'docBranch.addresses', 'baddr')
    .leftJoin('user.softSkills', 'ss')
    .leftJoin('user.hobbies', 'hb')
    .loadRelationCountAndMap('user.referenceCount', 'user.references')
    .loadRelationCountAndMap('user.fileCount', 'user.files')
    .leftJoin('user.degrees', 'deg')
    .select([
      'user',
      'addr',
      'doc',
      'docBranch.id',
      'docBranch.slug',
      'docBranch.status',
      'docBranch.name',
      'docBranch.picture',
      'docBranch.cover',
      'baddr',
      'ss',
      'hb',
      'deg.id',
      'deg.type',
    ])
    .getOne();
  }

  public async getBriefMe(authUserId: string): Promise<User> {
    const me = await this.userRepo.createQueryBuilder('user')
      .leftJoinAndMapOne('user.address', 'user.addresses', 'addr')
      .leftJoin('user.employments' ,'employment', 'employment.role != :employeeRole', { employeeRole: EmploymentRole.EMPLOYEE })
      .leftJoin('employment.company', 'company', 'company.status = :activeStatus', { activeStatus: UserStatus.AVAILABLE_ACTIVELY })
      .leftJoinAndMapOne('company.headquater', 'company.branches', 'branch', 'branch.isHeadquater')
      .leftJoinAndMapOne('branch.address', 'branch.addresses', 'baddr')
      .leftJoin('company.subscriptions', 'sub', 'sub.endAt >= :now AND (sub.jobAmount IS NULL OR sub.remainingJobs > 0)', { now: dayjs().format('YYYY-MM-DD') })
      .leftJoin('user.occupations', 'occu')
      .leftJoin('occu.profession', 'prof')
      .where('user.id = :authUserId', { authUserId })
      .select([
        'user.id',
        'user.slug',
        'user.type',
        'user.status',
        'user.firstName',
        'user.lastName',
        'user.picture',
        'user.progress',
        'user.email',
        'user.public',
        'user.emailAdTypes',
        'user.isAdmin',
        'addr',
        'company.id',
        'company.slug',
        'company.status',
        'company.type',
        'company.email',
        'employment.id',
        'employment.companyId',
        'employment.role',
        'branch.id',
        'branch.name',
        'branch.status',
        'branch.picture',
        'baddr.city',
        'baddr.zip',
        'baddr.text',
        'occu.id',
        'occu.slug',
        'prof',
        'sub.id',
        'sub.planId',
        'sub.jobAmount',
        'sub.remainingJobs',
        'sub.startAt',
        'sub.endAt',
      ])
      .getOne();

    if (!me) {
      throw new NotFoundException();
    }

    return me;
  }

  public list(searchUsersDto: SearchUsersDto): Promise<{ items: User[], total: number }> {
    const {
      order = 'createdAt',
      asc = false,
      skip = 0,
      take = 20,
      email,
    } = searchUsersDto;

    const qb = this.userRepo
      .createQueryBuilder('user')
      .select(['user', 'address'])
      .leftJoinAndMapOne('user.address', 'user.addresses', 'address')
      .andWhere('user.type < 4');

    if (email) {
      qb.andWhere('user.email LIKE :email', { email: `%${email}%` });
    }

    return qb
      .take(take)
      .skip(skip)
      .orderBy(`user.${order}`, asc ? 'ASC' : 'DESC')
      .getManyAndCount()
      .then(([items, total]) => ({ items, total }));
  }

  public search(searchUsersDto: SearchUsersDto, authUserId: string): Promise<{ items: User[], total: number }> {
    const {
      order = 'createdAt',
      asc = false,
      skip = 0,
      take = 3,
      firstName,
      lastName,
      email,
      friend,
    } = searchUsersDto;

    const qb = this.userRepo
      .createQueryBuilder('user')
      .select(['user.picture', 'user.id', 'user.slug', 'user.firstName', 'user.lastName', 'user.status', 'user.createdAt', 'address.city', 'address.zip'])
      .leftJoinAndMapOne('user.address', 'user.addresses', 'address')
      .where('user.status NOT IN (:...inactiveStatuses)', { inactiveStatuses: [UserStatus.DEACTIVATED, UserStatus.LOCKED] })
      .andWhere('user.type < 4')
      .andWhere('user.id != :authUserId', { authUserId });

    if (firstName) {
      qb.andWhere('LOWER(user.firstName) LIKE :firstName', { firstName: `%${firstName.toLowerCase()}%` });
    }

    if (lastName) {
      qb.andWhere('LOWER(user.lastName) LIKE :lastName', { lastName: `%${lastName.toLowerCase()}%` });
    }

    if (email) {
      qb.andWhere('user.email LIKE :email', { email: `%${email}%` });
    }

    if (friend !== undefined) {
      qb.andWhere(
        qb => `${friend ? '' : 'NOT '}EXISTS` + qb.subQuery()
          .select('c.id')
          .from(Contact, 'c')
          .where('(c.userId = user.id AND c.contactUserId = :authUserId) OR (c.userId = :authUserId AND c.contactUserId = user.id)', { authUserId })
          .getQuery()
      )
    }

    const sortOrder = asc ? 'ASC' : 'DESC';
    if (order === 'name') {
      qb
        .orderBy('user.firstName', sortOrder)
        .addOrderBy('user.lastName', sortOrder);
    } else {
      qb.orderBy(`user.${order}`, asc ? 'ASC' : 'DESC');
    }

    return qb
      .take(take)
      .skip(skip)
      .getManyAndCount()
      .then(([items, total]) => ({ items, total }));
  }

  public async searchOne(searchUserDto: SearchUserDto, authUserId: string): Promise<User> {
    const {
      email,
      phone,
      businessEmail,
    } = searchUserDto;

    const qb = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndMapOne('user.address', 'user.addresses', 'address')
      .where('user.status != :deactivatedStatus', { deactivatedStatus: UserStatus.DEACTIVATED })
      .andWhere('user.status != :lockedStatus', { lockedStatus: UserStatus.LOCKED })
      .andWhere('user.id != :authUserId', { authUserId })
      .select(['user.picture', 'user.id', 'user.slug', 'user.firstName', 'user.lastName', 'user.status', 'address.city', 'address.zip'])

    if (email) {
      qb.andWhere('user.email = :email', { email });
    }

    if (phone) {
      qb.andWhere('user.phone = :phone', { phone });
    }

    if (businessEmail) {
      qb
        .innerJoin('user.employments', 'employment')
        .innerJoin('employment.company', 'company')
        .where('employment.role = :adminRole', { adminRole: EmploymentRole.ADMIN })
        .andWhere('company.email = :businessEmail', { businessEmail });
    }

    const user = await qb.getOne();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  public patchPersonalInfo (patchMeDto: PatchMeDto, authUserId: string): Promise<User> {
    const { address, ...payload } = patchMeDto;
    if (address) {
      Object.assign(payload, { addresses: [address] });
    }
    const user = this.userRepo.create(payload);
    user.id = authUserId;

    return this.userRepo.save(user)
      .then((newUser) => {
        if (newUser.addresses) {
          newUser['address'] = newUser.addresses[0] || null;
          delete newUser.addresses;
        }

        return newUser;
      })
      .catch((e) => {
        if (e?.code === '23505' && e.detail?.includes?.('slug')) {
          throw new BadRequestException('Slug is already in use');
        } else {
          throw e;
        }
      });
  }

  public async deactivateMe (deactivateMeDto: DeactivateMeDto, authUserId: string): Promise<void> {
    const user: User = await this.authService.verifyPassword(authUserId, deactivateMeDto.password, true);
    const companyId = deactivateMeDto.companyId;

    if (companyId) {
      await this.employmentService.verifyPermission(authUserId, companyId);
    }

    await this.userRepo.update({ id: companyId || authUserId }, { status: UserStatus.DEACTIVATED });

    this.mailerSerive.sendMail({
      to: user.email,
      template: 'deactivate-user',
      subject: 'Du hast uns verlassen',
      context: {
        name: [user.firstName, user.lastName].filter(Boolean).join(' '),
      },
    })
  }

  public update(id: any, updateUserDto: any): Promise<User> {
    const user = this.userRepo.create(updateUserDto as User);
    user.id = id;

    return this.userRepo.save(user);
  }

  public create(createUserDto: any): Promise<User> {
    const user = this.userRepo.create(createUserDto as User);

    return this.userRepo.save(user);
  }

  public async patchUsers({ ids, ...dto }: PatchUsersDto): Promise<void> {
    await this.userRepo.update({ id: In(ids) }, dto);
  }
}
