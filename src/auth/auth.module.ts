import { Module, RequestMethod, MiddlewareConsumer, Global } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { FacebookStrategy } from './fb.strategy';
import { FacebookMiddleware } from './fb.middleware';
import { AuthUser } from './type/auth-user.interface';

declare global {
  namespace Express {
    interface User extends AuthUser {}
  }
}

@Global()
@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    FacebookStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(FacebookMiddleware)
      .forRoutes({ path: 'auth/redirect/facebook', method: RequestMethod.GET });
  }
}