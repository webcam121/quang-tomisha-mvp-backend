import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { classToPlain } from 'class-transformer';
import { UserService } from '../user/user.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.get('auth.facebook.clientId'),
      clientSecret: configService.get('auth.facebook.secret'),
      callbackURL: configService.get('domain') + 'auth/redirect/facebook',
      failureRedirect: configService.get('webAppDomain') + 'register',
      profileFields: ['id', 'email', 'name'],
      scope: ['email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any, info?: any) => void): Promise<void> {
    const { id, email, first_name, last_name } = {} = profile._json || {};

    const existedUser = await this.userService.userRepo.findOne({
      where: { email },
      select: ['id', 'password', 'isAdmin'],
    });
    if (existedUser) {
      return done(null, classToPlain(existedUser));
    }

    done(null, {
      email,
      firstName: first_name,
      lastName: last_name === first_name ? null : last_name,
      picture: `https://graph.facebook.com/${id}/picture?type=large`,
      isNew: true,
    });
  }
}
