import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { EmploymentService } from 'src/employment/employment.service';
import { EmailAdType } from 'src/user/type/email-ad-type.enum';
import { UserStatus } from 'src/user/type/user-status.enum';
import { UserService } from 'src/user/user.service';
import { In, Not, Repository } from 'typeorm';
import { Contact } from './contact.entity';
import { FindContactsDto } from './dto';
import { ContactStatus } from './type/contact-status.enum';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private contactRepo: Repository<Contact>,
    private userService: UserService,
    private mailerService: MailerService,
    private configService: ConfigService,
    private employmentService: EmploymentService,
  ) {}

  public getContactCount(authUserId: string): Promise<{ total: number }> {
    return this.contactRepo.count({
      where: [
        { contactUserId: authUserId, status: ContactStatus.ACTIVE },
        { userId: authUserId, status: ContactStatus.ACTIVE },
      ],
    }).then(total => ({ total }));
  }

  public find(findContactsDto: FindContactsDto, authUserId: string): Promise<{ total: number, items: Contact[] }> {
    const {
      order = 'updatedAt',
      asc = false,
      skip = 0,
      take = 10,
      status = ContactStatus.ACTIVE,
      name,
    } = findContactsDto;

    const qb = this.contactRepo
      .createQueryBuilder('contact')
      .select(['contact.id', 'contact.status', 'contact.acceptedAt', 'contact.updatedAt'])

    if (status === ContactStatus.BLOCKED) {
      qb
        .innerJoin('contact.contactUser', 'contactUser')
        .innerJoinAndMapOne('contactUser.address', 'contactUser.addresses', 'caddress')
        .where('contact.userId = :authUserId', { authUserId });
    } else {
      qb
        .leftJoin('contact.user', 'user', 'user.id != :authUserId', { authUserId })
        .leftJoinAndMapOne('user.address', 'user.addresses', 'address')
        .leftJoin('contact.contactUser', 'contactUser', 'contactUser.id != :authUserId', { authUserId })
        .leftJoinAndMapOne('contactUser.address', 'contactUser.addresses', 'caddress')
        .where('(contact.userId = :userId OR contact.contactUserId = :userId)', { userId: authUserId })
        .addSelect(['user.id', 'user.slug', 'user.status', 'user.firstName', 'user.lastName', 'user.picture', 'address.zip', 'address.city']);
    }

    if (status === ContactStatus.READ) {
      qb.andWhere('contact.status <= :status', { status });
    } else {
      qb.andWhere('contact.status = :status', { status });
    }

    if (name) {
      qb.andWhere('(LOWER(user.firstName) LIKE :name OR LOWER(user.lastName) LIKE :name)', { name: `%${name.toLowerCase()}%` });
    }

    return qb
      .addSelect(['contactUser.id', 'contactUser.slug', 'contactUser.status', 'contactUser.firstName', 'contactUser.lastName', 'contactUser.picture', 'caddress.zip', 'caddress.city'])
      .orderBy('contact.' + order, asc ? 'ASC' : 'DESC')
      .skip(skip)
      .take(take)
      .getManyAndCount()
      .then(([items, total]) => ({ items, total }));
  }

  public async blockUser(userId: string, authUserId: string, companyId?: string): Promise<void> {
    if (companyId) {
      this.employmentService.verifyPermission(authUserId, companyId);
    }

    const id = companyId || authUserId;

    const existedContact = await this.contactRepo.findOne({
      where: [
        { userId, contactUserId: id },
        { userId: id, contactUserId: userId },
      ],
      select: ['id', 'status'],
    });

    if (existedContact?.status === ContactStatus.BLOCKED) {
      return;
    }

    const contact = existedContact || this.contactRepo.create({});
    contact.status = ContactStatus.BLOCKED;
    contact.userId = userId;
    contact.contactUserId = id;

    await this.contactRepo.save(contact);
  }

  public async invite(userId: string, authUserId: string): Promise<void> {
    const existedContact = await this.contactRepo.findOne({
      where: [
        { userId, contactUserId: authUserId },
        { userId: authUserId, contactUserId: userId },
      ],
      select: ['id', 'status'],
    });

    if (existedContact?.status === ContactStatus.BLOCKED || existedContact?.status === ContactStatus.ACTIVE) {
      throw new BadRequestException();
    }

    const [receiver, sender] = await Promise.all([
      this.userService.userRepo.findOneOrFail({
        where: { id: userId, status: Not(In([UserStatus.DEACTIVATED, UserStatus.LOCKED])) },
        select: ['id', 'email', 'firstName', 'lastName'],
      }),
      this.userService.userRepo.findOneOrFail({
        where: { id: authUserId },
        select: ['id', 'slug', 'firstName', 'lastName', 'picture', 'status', 'emailAdTypes'],
        relations: ['addresses'],
      }),
    ]);

    if (receiver.emailAdTypes?.includes?.(EmailAdType.CONTACT_INVITATION)) {
      this.mailerService.sendMail({
        to: receiver.email,
        subject: `Einladung von ${sender.firstName || ''} ${sender.lastName || ''}`,
        template: 'invite-contact',
        context: {
          receiverName: [receiver.firstName, receiver.lastName].filter(Boolean).join(' '),
          senderName: [sender.firstName, sender.lastName].filter(Boolean).join(' '),
          senderPicture: sender.picture || this.configService.get('defaultUserPicture'),
          senderAddress: [sender.addresses?.[0]?.zip, sender.addresses?.[0]?.city].filter(Boolean).join(' '),
          href: this.configService.get('webAppDomain') + 'network/invitations',
        },
      });
    }

    const contact = existedContact || this.contactRepo.create({ userId, contactUserId: authUserId });
    contact.invitedAt = new Date();

    await this.contactRepo.save(contact);
  }

  public async acceptInvitation (id: number, authUserId: string): Promise<void> {
    const contact = await this.contactRepo.createQueryBuilder('contact')
      .where('contact.id = :id', { id })
      .andWhere('contact.status != :activeStatus', { activeStatus: ContactStatus.ACTIVE })
      .andWhere('(contact.userId = :userId OR contact.contactUserId = :userId)', { userId: authUserId })
      .select('contact')
      .getOne();

    if (!contact) {
      throw new NotFoundException();
    }

    await this.contactRepo.update({ id }, { status: ContactStatus.ACTIVE, acceptedAt: new Date() });
  }

  public async readAllInvitations (authUserId: string): Promise<void> {
    await this.contactRepo
      .createQueryBuilder('contact')
      .update()
      .set({ status: ContactStatus.READ })
      .where('contact.status = :unreadStatus', { unreadStatus: ContactStatus.UNREAD })
      .andWhere('(contact.userId = :userId OR contact.contactUserId = :userId)', { userId: authUserId })
      .execute();
  }

  public async removeContact (id: number, authUserId): Promise<void> {
    await this.contactRepo
      .createQueryBuilder('contact')
      .delete()
      .where('id = :id', { id })
      .andWhere('(contact.userId = :userId OR contact.contactUserId = :userId)', { userId: authUserId })
      .execute();
  }

  public async isBlocked ({ userId, viewerId }: { userId: string, viewerId: string }): Promise<boolean> {
    return !!(
      await this.contactRepo.createQueryBuilder('c')
        .where('c.status = :blockedStatus', { blockedStatus: ContactStatus.BLOCKED })
        .andWhere('((c.userId = :userId AND c.contactUserId = :viewerId) OR (c.userId = :viewerId AND c.contactUserId = :userId))', { userId, viewerId })
        .select('id')
        .getOne()
    );
  }
}
