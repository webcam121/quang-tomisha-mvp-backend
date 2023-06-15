import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AdminJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    if (!user?.isAdmin) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
