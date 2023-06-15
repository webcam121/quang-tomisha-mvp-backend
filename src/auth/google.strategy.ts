import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      clientID: configService.get('auth.google.clientId'),
      clientSecret: configService.get('auth.google.secret'),
      callbackURL: configService.get('domain') + 'auth/redirect/google',
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<void> {
    const { emails: [email] = [] } = profile;

    const existedUser = await this.userService.userRepo.findOne({ where: { email } });
    if (existedUser) {
      return done(null, existedUser);
    }

    const {
      name: { givenName: firstName = '', familyName: lastName = '' },
      photos: [{ value: picture = '' } = {}] = []
    } = profile

    const user = {
      email,
      firstName,
      lastName,
      picture,
      isNew: true,
    };

    done(null, user);
  }
}
