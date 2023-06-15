import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { EmploymentService } from 'src/employment/employment.service';
import { Repository } from 'typeorm';
import { CreateNotificationDto } from './dto';
import { Notification } from './notification.entity';
import { NotificationStatus } from './type/notification-status.enum';

@Injectable()
export class NotificationService {
  constructor (
    @InjectRepository(Notification)
    public notificationRepo: Repository<Notification>,
    private configService: ConfigService,
    private employmentService: EmploymentService,
  ) {}

  public async findById(id: number, authUserId: string, companyId?: string): Promise<Notification> {
    return (await this.createGetQueryBuilder(authUserId, companyId))
      .andWhere('noti.id = :id', { id })
      .getOne();
  }

  public async findMyActiveNotifications (authUserId: string, companyId: string): Promise<Notification[]> {
    return (await this.createGetQueryBuilder(authUserId, companyId))
      .take(100)
      .orderBy('noti.updatedAt', 'DESC')
      .getMany();
  }

  private async createGetQueryBuilder(authUserId: string, companyId: string): Promise<any> {
    const role = companyId && await this.employmentService.verifyPermission(authUserId, companyId);

    const qb = this.notificationRepo
      .createQueryBuilder('noti')
      .leftJoin('noti.fromUser', 'fu')
      .leftJoinAndMapOne('fu.address', 'fu.addresses', 'ua')
      .leftJoin('noti.fromBranch', 'fb')
      .leftJoinAndMapOne('fb.address', 'fb.addresses', 'ba')
      .select([
        'noti',
        'fu.id',
        'fu.slug',
        'fu.status',
        'fu.picture',
        'fu.firstName',
        'fu.lastName',
        'ua.text',
        'ua.zip',
        'ua.city',
        'ua.text',
        'fb.id',
        'fb.companyId',
        'fb.status',
        'fb.picture',
        'fb.name',
        'ba.text',
        'ba.city',
        'ba.zip',
        'ba.text',
      ])
      .where('noti.status = :activeStatus', { activeStatus: NotificationStatus.ACTIVE });

    if (companyId) {
      qb
        .andWhere('noti.companyId = :companyId', { companyId })
        .andWhere('noti.minRole <= :role', { role });
    } else {
      qb
        .andWhere('noti.userId = :authUserId', { authUserId });
    }

    return qb;
  }

  public async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const uniqueMetadata = { ...createNotificationDto, status: NotificationStatus.ACTIVE };
    delete uniqueMetadata.message;
    delete uniqueMetadata.metadata;

    const existedNoti = await this.notificationRepo.findOne({ where: uniqueMetadata });
    if (existedNoti) {
      Object.assign(existedNoti, uniqueMetadata);
      return this.notificationRepo.save(existedNoti);
    }

    const notification = this.notificationRepo.create(createNotificationDto);
    return this.notificationRepo.save(notification);
  }

  public async setStatus (id: number, status: NotificationStatus, authUserId: string): Promise<void> {
    await this.notificationRepo.update({ id }, { status });
  }

  public generateWebappUrl(notification: Notification) {
    return this.configService.get('webAppDomain') +
      `notification?notificationId=${notification.id}&type=${notification.type}&receiverId=${notification.userId || notification.companyId}`;
  }
}
