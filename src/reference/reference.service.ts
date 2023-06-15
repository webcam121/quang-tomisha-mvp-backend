import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationStatus } from 'src/notification/type/notification-status.enum';
import { NotificationType } from 'src/notification/type/notification-type.enum';
import { UserService } from 'src/user/user.service';
import { VerificationService } from 'src/verification/verification.service';
import { Repository } from 'typeorm';
import { CreateReferenceDto } from './dto';
import { ReferenceViewer } from './reference-viewer.entity';
import { Reference } from './reference.entity';

const REF_INVITATION_EXP = 86400 * 14;

@Injectable()
export class ReferenceService {
  constructor (
    @InjectRepository(Reference)
    private referenceRepo: Repository<Reference>,
    @InjectRepository(ReferenceViewer)
    private referenceViewerRepo: Repository<ReferenceViewer>,
    private mailerService: MailerService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private configService: ConfigService,
    private verificationService: VerificationService,
    @Inject(forwardRef(() => NotificationService))
    private notificationService: NotificationService,
  ) {}

  public findMyReferences (authUserId: string): Promise<Reference[]> {
    return this.referenceRepo.find({
      where: {
        userId: authUserId,
      },
      order: {
        createdAt: 'DESC',
      },
      relations: ['refUser'],
    });
  }

  public findMySentReferences (authUserId: string): Promise<Reference[]> {
    return this.referenceRepo.find({
      where: {
        refUserId: authUserId,
      },
      order: {
        createdAt: 'DESC'
      },
      relations: ['user'],
    });
  }

  public findReferencesByUserId (userId: string, authUserId: string): Promise<Reference[]> {
    return this.referenceRepo
      .createQueryBuilder('ref')
      .innerJoin('ref.user', 'user')
      .innerJoin('ref.refUser', 'refUser')
      .leftJoinAndMapOne('refUser.address', 'refUser.addresses', 'address')
      .where('ref.userId = :userId', { userId })
      .andWhere((qb) => {
        return `user.publicRef OR ref.userId = :authUserId OR EXISTS ` + qb.subQuery()
          .select('id')
          .from(ReferenceViewer, 'refViewer')
          .where('refViewer.userId = :userId', { userId })
          .andWhere('refViewer.viewerId = :authUserId', { authUserId })
          .getQuery();
      }, { authUserId })
      .select([
        'ref.id',
        'ref.criterias',
        'ref.description',
        'ref.rating',
        'ref.updatedAt',
        'refUser.id',
        'refUser.slug',
        'refUser.picture',
        'refUser.firstName',
        'refUser.lastName',
        'refUser.status',
        'address.city',
        'address.zip',
        'address.text',
      ])
      .orderBy('ref.updatedAt', 'DESC')
      .getMany();
  }

  public async inviteReference(userId: string, refUserId: string):  Promise<void> {
    const [user, refUser] = await Promise.all([
      this.userService.userRepo.findOne({
        where: { id: userId },
        select: ['id', 'firstName', 'lastName'],
        relations: ['addresses'],
      }),

      this.userService.userRepo.findOne({
        where: { id: refUserId },
        select: ['id', 'email', 'firstName', 'lastName', 'picture'],
      }),
    ]);

    if (!refUser) {
      throw new BadRequestException('User not found');
    }

    const notification = await this.notificationService.create({
      fromUserId: userId,
      userId: refUserId,
      type: NotificationType.REFERENCE_INVITE,
    });

    await this.mailerService.sendMail({
      to: refUser.email,
      subject: 'Anfrage zur Referenzerstellung',
      template: 'reference-invitation',
      context: {
        receiverName: refUser.firstName + ' ' + refUser.lastName,
        senderName: user.firstName + ' ' + user.lastName,
        senderPicture: user.picture || this.configService.get('defaultUserPicture'),
        senderAddress: [user.addresses?.[0]?.zip, user.addresses?.[0]?.city].filter(Boolean).join(' '),
        href: this.notificationService.generateWebappUrl(notification),
      },
    });
  }

  public async create(createReferenceDto: CreateReferenceDto, authUserId: string): Promise<void> {
    const { user: refUser, fromUser: user } = await this.notificationService.notificationRepo.findOneOrFail({
      where: { id: createReferenceDto.notificationId, userId: authUserId, status: NotificationStatus.ACTIVE },
      relations: ['user', 'fromUser', 'user.addresses'],
    });

    const reference = this.referenceRepo.create({
      userId: user.id,
      refUserId: authUserId,
      description: createReferenceDto.description,
      criterias: createReferenceDto.criterias,
      rating: createReferenceDto.rating,
    });

    await this.referenceRepo.save(reference);

    this.notificationService.notificationRepo.update({ id: createReferenceDto.notificationId }, { status: NotificationStatus.YES })

    this.mailerService.sendMail({
      to: user.email,
      subject: 'Neue Referenz',
      template: 'new-reference',
      context: {
        receiverName: user.firstName + ' ' + user.lastName,
        senderPicture: refUser.picture || this.configService.get('defaultUserPicture'),
        senderName: refUser.firstName + ' ' + refUser.lastName,
        senderAddress: [refUser.addresses?.[0]?.zip, refUser.addresses?.[0]?.city].filter(Boolean).join(' '),
        href: this.configService.get('webAppDomain') + 'network/references',
      }
    })
  }

  public async requestViewReferences(userId: string, authUserId: string): Promise<void> {
    if (await this.referenceViewerRepo.findOne({ where: { userId, viewerId: authUserId } })) {
      throw new BadRequestException('Already approved');
    }

    const [user, viewer] = await Promise.all([
      this.userService.userRepo.findOne({
        where: { id: userId },
        select: ['id', 'firstName', 'lastName', 'email'],
      }),

      this.userService.userRepo.findOne({
        where: { id: authUserId },
        select: ['id', 'firstName', 'lastName', 'picture'],
        relations: ['addresses'],
      }),
    ]);

    this.notificationService.create({
      type: NotificationType.REFERENCE_VIEW_REQUEST,
      userId,
      fromUserId: authUserId,
    });

    await this.mailerService.sendMail({
      to: user.email,
      subject: `Antwort auf deine Referenzanfrage`,
      template: 'application-ref-request',
      context: {
        receiverName: user.firstName + ' ' + user.lastName,
        senderName: viewer.firstName + ' ' + viewer.lastName,
        senderPicture: viewer.picture || this.configService.get('defaultUserPicture'),
        senderAddress: [viewer.addresses?.[0]?.zip, viewer.addresses?.[0]?.city].filter(Boolean).join(' '),
        href: this.configService.get('webAppDomain'),
      },
    });
  }

  public async allowViewReferences(viewerId: string, authUserId: string) {
    if (await this.referenceViewerRepo.findOne({ where: { userId: authUserId, viewerId } })) {
      throw new BadRequestException('Already approved');
    }

    const newRecord = this.referenceViewerRepo.create({ userId: authUserId, viewerId });
    await this.referenceViewerRepo.save(newRecord);

    this.notificationService.notificationRepo.update(
      {
        fromUserId: viewerId,
        userId: authUserId,
        type: NotificationType.REFERENCE_VIEW_REQUEST,
        status: NotificationStatus.ACTIVE
      },
      {
        status: NotificationStatus.YES,
      },
    )
  }

  public async canView({ userId, viewerId }: { userId: string, viewerId: string }): Promise<boolean> {
    if (userId === viewerId) {
      return true;
    }

    return !!(await this.referenceViewerRepo.count({ where: { userId, viewerId } }));
  }
}
