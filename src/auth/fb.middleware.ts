import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: Function) {
    if (req.query?.error || req.query?.error_code) {
      res.redirect(this.configService.get('webAppDomain') + 'register');
    } else {
      next();
    }
  }
}
