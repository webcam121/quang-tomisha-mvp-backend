import { BadRequestException, forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { FindEmploymentsDto, UpdateEmploymentDto, InviteEmploymentDto, CreateEmploymentDto, AcceptEmploymentInvitationDto } from './dto';
import { Employment } from './employment.entity';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/type/notification-type.enum';
import { EmploymentPermission } from './type/employment-permission.enum';
import { NotificationStatus } from 'src/notification/type/notification-status.enum';
import { BranchService } from 'src/branch/branch.service';
import { EmploymentRole } from './type/employment-role.enum';
import { AuthService } from 'src/auth/auth.service';
import { parseJSON } from 'src/shared/utils';

const EMPLOYMENT_INVITATION_EXPIRES_IN = 30 * 3600;

const createRolePermissionTable = {
  [EmploymentRole.ADMIN]: EmploymentPermission.CREATE_OWNER,
  [EmploymentRole.MAINTAINER]: EmploymentPermission.CREATE_MAINTAINER,
  [EmploymentRole.HR]: EmploymentPermission.CREATE_HR,
  [EmploymentRole.EMPLOYEE]: EmploymentPermission.CREATE_EMPLOYEE,
};

@Injectable()
export class EmploymentService {
  constructor(
    @InjectRepository(Employment)
    public employmentRepo: Repository<Employment>,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    @Inject(forwardRef(() => BranchService))
    private branchService: BranchService,
    private mailService: MailerService,
    @Inject(forwardRef(() => NotificationService))
    private notificationService: NotificationService,
    private configService: ConfigService,
  ) {}

  public find(findEmploymentsDto: FindEmploymentsDto): Promise<Employment[]> {
    const { companyId, branchId } = findEmploymentsDto;
    const qb = this.employmentRepo
      .createQueryBuilder('em')
      .leftJoin('em.profession', 'prof')
      .innerJoin('em.user', 'user')
      .where('em.role > :employeeRole', { employeeRole: EmploymentRole.EMPLOYEE });

    if (branchId) {
      qb.andWhere('em.branchId = :branchId', { branchId: findEmploymentsDto.branchId });
    } else if (companyId) {
      qb.andWhere('em.branchId = :companyId', { branchId: findEmploymentsDto.companyId });
    }

    return qb
      .select([
        'em.id',
        'em.companyId',
        'prof.title',
        'user.id',
        'user.slug',
        'user.status',
        'user.picture',
        'user.firstName',
        'user.lastName',
      ])
      .getMany();
  }

  public async findAgencyCandidates(agencyId: string, authUserId: string): Promise<Employment[]> {
    await this.verifyPermission(authUserId, agencyId);

    return this.employmentRepo
      .createQueryBuilder('em')
      .leftJoin('em.profession', 'prof')
      .leftJoin('em.agent', 'agent')
      .leftJoin('em.branch', 'bran')
      .innerJoin('em.user', 'user')
      .leftJoinAndMapOne('bran.address', 'bran.addresses', 'badr')
      .where('em.agencyId = :agencyId', { agencyId })
      .andWhere('em.role = :employeeRole', { employeeRole: EmploymentRole.EMPLOYEE })
      .select([
        'em.id',
        'prof.title',
        'user.id',
        'user.slug',
        'user.status',
        'user.picture',
        'user.firstName',
        'user.lastName',
        'agent.id',
        'agent.slug',
        'agent.status',
        'agent.picture',
        'agent.firstName',
        'agent.lastName',
        'bran.id',
        'bran.name',
        'bran.status',
        'bran.picture',
        'badr.city',
        'badr.zip',
        'badr.components',
      ])
      .getMany();
  }

  public async invite(inviteEmploymentDto: InviteEmploymentDto, authUserId: string): Promise<void> {
    const { branchId, companyId, userEmail, message, role, password } = inviteEmploymentDto;

    if (role === EmploymentRole.ADMIN) {
      await this.authService.verifyPassword(authUserId, password);
    }

    const [receiver, sender] = await Promise.all([
      this.userService.userRepo.findOneOrFail({ where: { email: userEmail }, select: ['id', 'firstName', 'lastName', 'email'] })
        .catch(() => {
          throw new BadRequestException('User not found');
        }),
      this.employmentRepo.findOneOrFail({ where: { userId: authUserId, companyId }, relations: ['user', 'profession'] }),
      // Verify branchId and companyId pair exists
      this.branchService.branchRepo.findOneOrFail({ where: { id: branchId, companyId } }),
      // Verify the permission of the authUser with the company
      this.verifyPermission(authUserId, companyId, createRolePermissionTable[inviteEmploymentDto.role]),
    ]);

    const notification = await this.notificationService.create({
      type: NotificationType.STAFF_INVITE,
      userId: receiver.id,
      fromUserId: authUserId,
      fromBranchId: branchId,
      metadata: JSON.stringify({ role }),
    });

    const senderName = [sender.user.firstName, sender.user.lastName].filter(Boolean).join(' ');

    await this.mailService.sendMail({
      to: receiver.email,
      subject: `${senderName} via Tomisha`,
      template: 'staff-invitation',
      context: {
        receiverName: [receiver.firstName, receiver.lastName].filter(Boolean).join(' '),
        senderName,
        senderProfession: sender.profession?.title || '',
        senderPicture: sender.user.picture || this.configService.get('defaultUserPicture'),
        message,
        href: this.notificationService.generateWebappUrl(notification),
        expHours: Math.round(EMPLOYMENT_INVITATION_EXPIRES_IN / 3600),
      },
    });
  }

  public async acceptInvitation({ notificationId, ...acceptInvitationDto }: AcceptEmploymentInvitationDto, authUserId: string): Promise<Employment> {
    const notification = await this.notificationService.notificationRepo.findOneOrFail({
      where: { id: notificationId, userId: authUserId },
      relations: ['fromBranch'],
    });

    const { role } = parseJSON(notification.metadata) || {};
    if (!role) {
      throw new BadRequestException();
    }

    // Mark all invitations status as accepted
    this.notificationService.notificationRepo.update({
      userId: authUserId,
      fromBranchId: notification.fromBranchId,
      type: NotificationType.STAFF_INVITE,
      status: NotificationStatus.ACTIVE
    }, { status: NotificationStatus.YES });

    // Notify employer
    this.notificationService.create({
      companyId: notification.fromBranch.companyId,
      fromUserId: authUserId,
      type: NotificationType.STAFF_INVITE_ACCEPTED,
      minRole: createRolePermissionTable[role],
      metadata: JSON.stringify({ role }),
    });

    const employment = this.employmentRepo.create({
      ...acceptInvitationDto,
      userId: authUserId,
      companyId: notification.fromBranch.companyId,
      branchId: notification.fromBranchId,
      role,
    });
    return this.employmentRepo.save(employment);
  }

  public async create(createEmploymentDto: CreateEmploymentDto, authUserId: string) {
    if (createEmploymentDto.role === EmploymentRole.ADMIN) {
      await this.authService.verifyPassword(authUserId, createEmploymentDto.password);
    }

    const notification = await this.notificationService.notificationRepo.findOneOrFail({
      where: { id: createEmploymentDto.notificationId },
      relations: ['fromUser'],
    });

    const role: EmploymentRole = createEmploymentDto.role;
    const { companyId, fromUserId, fromUser } = notification;

    await Promise.all([
      this.verifyPermission(authUserId, companyId, createRolePermissionTable[role]),
      this.branchService.branchRepo.findOneOrFail({ id: createEmploymentDto.branchId, companyId }),
    ]);

    const employment = this.employmentRepo.create({
      ...parseJSON(notification.metadata),
      companyId,
      userId: fromUserId,
      role: createEmploymentDto.role,
      branchId: createEmploymentDto.branchId,
    });

    this.mailService.sendMail({
      to: fromUser.email,
      subject: 'Du bist in einem neuen Unternehmen',
      template: 'request-join-company-accepted',
      context: {
        senderName: [fromUser.firstName, fromUser.lastName].join(' '),
        href: this.configService.get('webAppDomain') + 'dashboard?companyId=' + companyId,
      },
    });

    // Update notification status
    notification.status = NotificationStatus.YES;
    this.notificationService.notificationRepo.save(notification);

    // TODO invite employment instead of ok right away
    if (role === EmploymentRole.ADMIN) {
      this.employmentRepo.update({ companyId, role: EmploymentRole.ADMIN }, { role: EmploymentRole.MAINTAINER });
    }

    return this.employmentRepo.save(employment);
  }

  public async update(id: number, updateEmploymentDto: UpdateEmploymentDto, authUserId: string): Promise<Employment> {
    const employment = await this.employmentRepo.findOneOrFail({ id });

    await this.verifyPermission(authUserId, employment.companyId, createRolePermissionTable[employment.role]);

    Object.assign(employment, updateEmploymentDto);

    return this.employmentRepo.save(employment);
  }

  public async verifyPermission (userId: string, companyId: string, right: EmploymentPermission = 1): Promise<EmploymentRole> {
    const employment = await this.employmentRepo.findOne({
      where: {
        userId,
        companyId,
        role: MoreThanOrEqual(right),
      },
    });

    if (employment) {
      return employment.role;
    }

    throw new UnauthorizedException();
  }
}
