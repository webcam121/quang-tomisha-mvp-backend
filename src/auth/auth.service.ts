import { Injectable, BadRequestException, InternalServerErrorException, Inject, forwardRef, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import fetch from 'node-fetch';

import { UserService } from '../user/user.service';
import { compareHash, hash } from '../shared/utils';
import { AuthUser } from './type/auth-user.interface';
import { ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto, RegisterDto, RequestNewEmailDto } from './dto';
import { VerificationService } from 'src/verification/verification.service';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/type/notification-type.enum';
import { VerificationType } from 'src/verification/type/verification-type.enum';
import { LessThanOrEqual } from 'typeorm';
import { UserType } from 'src/user/type/user-type.enum';
import { UserStatus } from 'src/user/type/user-status.enum';

const FORGOT_PW_EXP_SEC = 24 * 60 * 60; // 1d
const VERIFY_EMAIL_EXP_SEC = 24 * 60 * 60; // 1d

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private configService: ConfigService,
    private verificationService: VerificationService,
    private notificationService: NotificationService,
  ) {}

  public async validateUser(email: string, pass: string): Promise<AuthUser> {
    const user = await this.userService.userRepo.findOne({
      where: {
        email: email?.toLowerCase?.().trim(),
        type: LessThanOrEqual(UserType.AGENT),
      },
      select: ['id', 'password', 'isAdmin'],
    });
    if (user?.status === UserStatus.LOCKED) {
      throw new ForbiddenException('You are forbidden from signing in');
    } if (user?.password && compareHash(pass, user.password)) {
      delete user.password;
      return user;
    } else {
      throw new BadRequestException('E-Mail oder Passwort ist nicht korrekt');
    }
  }

  public async login(user: any) {
    if (user.status === UserStatus.DEACTIVATED) {
      user.status = UserStatus.AVAILABLE_PRIVATELY;
      this.userService.userRepo.update({ id: user.id }, { status: user.status });
    }

    const payload: AuthUser = {
      id: user.id,
      isAdmin: user.isAdmin,
      type: user.type,
    };

    return {
      user,
      accessToken: this.jwtService.sign(payload, {
        expiresIn: this.configService.get('auth.expiresIn'),
      }),
    };
  }

  public async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<void> {
    const { email, firstName, lastName } = verifyEmailDto;
    const existedUser = await this.userService.userRepo.findOne({ where: { email }, select: ['id'] });
    if (!!existedUser) {
      throw new BadRequestException('Überprüfe, ob du die E-Mail-Adresse korrekt eingeben hast');
    }

    await this.mailerService.sendMail({
      to: email,
      subject: 'Bitte bestätige deine E-Mail-Adresse',
      template: 'verify-email',
      context: {
        receiverName: firstName + ' ' + lastName,
        expHours: Math.round(VERIFY_EMAIL_EXP_SEC / 3600),
        href: await this.generateCreateAccountUrl({
          email,
          firstName,
          lastName,
        }),
      },
    });
  }

  public async verifyPassword(userId: string, password: string, returnUser?: boolean): Promise<any> {
    if (!password) {
      throw new BadRequestException('Wrong password');
    }

    const user = await this.userService.userRepo.findOne({
      where: { id: userId },
      select: returnUser ? ['id', 'email', 'firstName', 'lastName', 'password'] : ['password'],
    });

    if (user && compareHash(password, user.password)) {
      return returnUser ? user : true;
    } else {
      throw new BadRequestException('Wrong password');
    }
  }

  public async generateLoginCallbackUrl(user: any) {
    const token = this.jwtService.sign({ user }, {
      expiresIn: this.configService.get('auth.expiresIn'),
      noTimestamp: true,
    });
    return this.configService.get('webAppDomain') + `token?type=${VerificationType.AUTH_LOGIN}&token=${token}`;
  }

  public generateCreateAccountUrl(data: any, skipVerification: boolean = false): Promise<string> {
    return this.verificationService.createTokenUrl({
      type: VerificationType.AUTH_REGISTER,
      id: data.email,
      data,
      expiresIn: VERIFY_EMAIL_EXP_SEC,
      skipVerification,
    })
  }

  public async registerLocal(registerDto: RegisterDto): Promise<any> {
    const { password, token, captcha, type } = registerDto;

    const hcaptchaUrl = `https://hcaptcha.com/siteverify?secret=${this.configService.get('hcaptcha.secret')}&response=${captcha}`;
    const hcaptchaResponse = await fetch(hcaptchaUrl, { method: 'post' });
    const json = await hcaptchaResponse.json();
    if (!json.success) {
      throw new BadRequestException('hCaptcha verification fail');
    }

    const { data } = await this.verificationService.validateToken(token, { type: VerificationType.AUTH_REGISTER });

    const newUser = await this.userService.create({
      password,
      type,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      picture: data.picture,
      lastActiveAt: new Date(),
    });

    this.notificationService.create({ userId: newUser.id, type: NotificationType.WELCOME });
    this.notificationService.create({ userId: newUser.id, type: NotificationType.ADD_FIRST_FRIEND });

    delete newUser.password;
    return newUser;
  }

  // public async findOrCreateUser(user: any) {
  //   const existedUser = await this.userService.userRepo.findOne({ where: { email: user.email } });
  //   return existedUser || this.userService.create(user);
  // }

  public async changePassword(changePasswordDto: ChangePasswordDto, authUserId: string) {
    const me = await this.userService.userRepo.findOne({ where: { id: authUserId }, select: ['id', 'password'] });

    if (me && compareHash(me.password, changePasswordDto.oldPassword)) {
      return this.userService.update(me.id, { password: hash(changePasswordDto.newPassword) });
    }

    throw new BadRequestException('Password is incorrect');
  }

  public async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const { email } = forgotPasswordDto;
    const user = await this.userService.userRepo.findOne({ where: { email }, select: ['id', 'email', 'firstName', 'lastName'] });

    if (!user) {
      return;
    }

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Dein Passwort zurücksetzen',
      template: 'forgot-pw-email',
      context: {
        receiverName: user.firstName + ' ' + user.lastName,
        href: await this.verificationService.createTokenUrl({
          type: VerificationType.AUTH_RESET_PW,
          id: user.id,
          expiresIn: FORGOT_PW_EXP_SEC,
          receiverId: user.id,
        }),
        expHours: Math.round(VERIFY_EMAIL_EXP_SEC / 3600),
      },
    })
      .catch(() => {
        throw new InternalServerErrorException('Server cannot send email');
      });
  }

  public async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, newPassword } = resetPasswordDto;

    const { receiverId } = await this.verificationService.validateToken(token, { type: VerificationType.AUTH_RESET_PW });

    await this.userService.update(receiverId, {
      password: hash(newPassword),
    });
  }

  public async requestNewEmail(newEmailDto: RequestNewEmailDto, authUserId: string): Promise<void> {
    await this.verifyPassword(authUserId, newEmailDto.password);

    if (await this.userService.userRepo.findOne({
      where: { email: newEmailDto.email },
      select: ['id'],
    })) {
      throw new BadRequestException('Überprüfe, ob du die E-Mail-Adresse korrekt eingeben hast');
    }


    const { email, firstName, lastName } = await this.userService.userRepo.findOne({ where: { id: authUserId }, select: ['email', 'firstName', 'lastName'] });

    await this.mailerService.sendMail({
      to: email,
      subject: 'Bitte bestätige deine E-Mail-Adresse',
      template: 'verify-email',
      context: {
        receiverName: firstName + ' ' + lastName,
        expHours: Math.round(VERIFY_EMAIL_EXP_SEC / 3600),
        href: await this.verificationService.createTokenUrl({
          type: VerificationType.CHANGE_EMAIL,
          id: newEmailDto.email,
          receiverId: authUserId,
          data: { email },
          expiresIn: VERIFY_EMAIL_EXP_SEC,
        }),
      },
    })
  }

  public async changeEmail(token: string): Promise<void> {
    const { data, receiverId } = await this.verificationService.validateToken(token);

    await this.userService.userRepo.update({ id: receiverId }, { email: data.email });
  }
}
